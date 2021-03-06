import { BigNumber, createBigNumber } from 'utils/create-big-number';

import { BUY, MAX_BULK_ORDER_COUNT, PUBLICTRADE, ZERO } from 'modules/common/constants';
import { LiquidityOrder, CreateLiquidityOrders } from 'modules/types';
import {
  createLiquidityOrder,
  isTransactionConfirmed,
  approveToTrade,
  placeTrade,
} from 'modules/contracts/actions/contractCalls';
import type { Getters } from '@augurproject/sdk';
import { TXEventName } from '@augurproject/sdk-lite';
import { processLiquidityOrder } from 'modules/events/actions/liquidity-transactions';
import {
  convertDisplayAmountToOnChainAmount,
  convertDisplayPriceToOnChainPrice,
} from "@augurproject/utils"
import { AppStatus } from 'modules/app/store/app-status';
import { Markets } from 'modules/markets/store/markets';
import { PendingOrders } from 'modules/app/store/pending-orders';
import { updateAlert } from 'modules/alerts/actions/alerts';
// liquidity should be an orderbook, example with yesNo:
// { 1: [{ type, quantity, price, orderEstimate }, ...], ... }

export const loadPendingLiquidityOrders = (
  pendingLiquidityOrders: Getters.Markets.OutcomeOrderBook
) => {
  const ordersWithHashes = [];
  Object.keys(pendingLiquidityOrders).map((txMarketHashId: string) => {
    Object.keys(pendingLiquidityOrders[txMarketHashId]).map(outcomeId => {
      const orders = pendingLiquidityOrders[txMarketHashId][outcomeId];
      orders.map((o: LiquidityOrder) => {
        if (!o.hash && o.status) delete o.status;
        if (o.hash) ordersWithHashes.push({ ...o, txMarketHashId });
      });
      if (pendingLiquidityOrders[txMarketHashId][outcomeId].length === 0)
        delete pendingLiquidityOrders[txMarketHashId][outcomeId];
    });
    if (Object.keys(pendingLiquidityOrders[txMarketHashId]).length === 0)
      delete pendingLiquidityOrders[txMarketHashId];
  });
  PendingOrders.actions.loadLiquidity(pendingLiquidityOrders);

  // remove orders that have been confirmed
  ordersWithHashes.map(async o => {
    const confirmed = await isTransactionConfirmed(o.hash);
    if (confirmed)
      PendingOrders.actions.removeLiquidity({
        txParamHash: o.txMarketHashId,
        outcomeId: o.outcomeId,
        orderId: o.index,
      });
  });
};

export const sendLiquidityOrder = async (options: any) => {
  const { order, bnAllowance, marketId } = options;
  const { marketInfos } = Markets.get();
  const market = marketInfos[marketId];
  const isZeroX = options.zeroXEnabled;
  const { orderEstimate } = order;
  const properties = processLiquidityOrder(
    {
      outcomeId: order.outcomeId,
      orderPrice: order.price,
      orderType: order.type,
      eventName: TXEventName.Pending,
    },
    market
  );
  PendingOrders.actions.updateLiquidityStatus({
    txParamHash: properties.transactionHash,
    ...properties,
    eventName: TXEventName.Pending,
  });

  if (bnAllowance.lte(0) || bnAllowance.lte(createBigNumber(orderEstimate))) {
    await approveToTrade();
    isZeroX
      ? createZeroXLiquidityOrders(market, [options.order])
      : sendOrder(options);
  } else {
    isZeroX
      ? createZeroXLiquidityOrders(market, [options.order])
      : sendOrder(options);
  }
};

const sendOrder = async options => {
  const { marketId, order, minPrice, maxPrice, numTicks, orderCB } = options;
  const orderType = order.type === BUY ? 0 : 1;
  try {
    createLiquidityOrder({
      ...order,
      orderType,
      minPrice,
      maxPrice,
      numTicks,
      marketId,
    });
  } catch (e) {
    console.error('could not create order', e);
  }
  orderCB();
};

export const startOrderSending = async ({
  marketId
}: CreateLiquidityOrders) => {
  const { marketInfos } = Markets.get();
  const { pendingLiquidityOrders } = PendingOrders.get();
  const { loginAccount, gsnEnabled, zeroXEnabled } = AppStatus.get();
  const chunkOrders = !zeroXEnabled;
  // If GSN is enabled no need to call the below since this will be handled by the proxy contract during initalization
  if (!gsnEnabled && loginAccount.allowance.lte(ZERO)) await approveToTrade();

  const market = marketInfos[marketId];
  let orders = [];
  const liquidity = pendingLiquidityOrders[market.transactionHash];
  Object.keys(liquidity).map(outcomeId => {
    orders = [...orders, ...liquidity[outcomeId]];
  });

  if (!chunkOrders) {
    await createZeroXLiquidityOrders(market, orders);
  } else {
    // MAX_BULK_ORDER_COUNT number of orders in each creation bulk group
    let i = 0;
    const groups = [];
    for (i; i < orders.length; i += MAX_BULK_ORDER_COUNT) {
      groups.push(orders.slice(i, i + MAX_BULK_ORDER_COUNT));
    }
    try {
      groups.map(group => createZeroXLiquidityOrders(market, group));
    } catch (e) {
      console.error(e);
    }
  }
};

const createZeroXLiquidityOrders = async (
  market: Getters.Markets.MarketInfo,
  orders: LiquidityOrder[]
) => {
  const { blockchain: { currentAugurTimestamp: timestamp }} = AppStatus.get();
  try {
    const fingerprint = undefined; // TODO: get this from state
    let i = 0;
    // set all orders to pending before processing them.
    for (i; i < orders.length; i++) {
      const o: LiquidityOrder = orders[i];
      if (o.status !== TXEventName.Pending) {
        const properties = processLiquidityOrder(
          {
            outcomeId: o.outcomeId,
            orderPrice: createBigNumber(o.price).toString(),
            orderType: o.type,
            eventName: TXEventName.Pending,
          },
          market
        );
        PendingOrders.actions.updateLiquidityStatus({
          txParamHash: properties.transactionHash,
          ...properties,
          eventName: TXEventName.Pending,
        });
      }
    }
    for (i = 0; i < orders.length; i++) {
      const o: LiquidityOrder = orders[i];
      await placeTrade(
        o.type === BUY ? 0 : 1,
        market.id,
        market.numOutcomes,
        o.outcomeId,
        false,
        market.numTicks,
        market.minPrice,
        market.maxPrice,
        o.quantity,
        o.price,
        '0',
        undefined
      )
        .then(() => {
          const alert = {
            eventType: o.type,
            market: market.id,
            name: PUBLICTRADE,
            status: TXEventName.Success,
            timestamp: timestamp * 1000,
            params: {
              outcome: '0x0'.concat(String(o.outcomeId)),
              price: convertDisplayPriceToOnChainPrice(
                createBigNumber(o.price),
                createBigNumber(market.minPrice),
                createBigNumber(market.tickSize)
              ),
              orderType: o.type === BUY ? 0 : 1,
              amount: convertDisplayAmountToOnChainAmount(
                createBigNumber(o.shares),
                createBigNumber(market.tickSize)
              ),
              marketId: market.id,
            },
          };
          updateAlert(undefined, alert, false);
          PendingOrders.actions.updateSuccessfulLiquidity({
            txParamHash: market.transactionHash,
            outcomeId: o.outcomeId,
            type: o.type,
            price: o.price,
          });
        })
        .catch(err => {
          const properties = processLiquidityOrder(
            {
              outcomeId: o.outcomeId,
              orderPrice: createBigNumber(o.price).toString(),
              orderType: o.type,
              eventName: TXEventName.Failure,
            },
            market
          );
          PendingOrders.actions.updateLiquidityStatus({
            txParamHash: properties.transactionHash,
            ...properties,
            eventName: TXEventName.Failure,
          });
        });
    }
  } catch (e) {
    console.error(e);
  }
};
