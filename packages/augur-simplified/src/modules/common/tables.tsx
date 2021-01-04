import React, { useState } from 'react';
import Styles from 'modules/common/tables.styles.less';
import { EthIcon, UsdIcon } from './icons';
import {
  PrimaryButton,
  SecondaryButton,
  TinyButton,
} from 'modules/common/buttons';
import classNames from 'classnames';
import {
  POSITIONS,
  LIQUIDITY,
  ALL,
  ADD,
  REMOVE,
  SWAP,
} from 'modules/constants';
import { Pagination } from 'modules/common/pagination';
import { SmallDropdown } from './selection';
import {
  AmmExchange,
  AmmTransaction,
  LPTokenBalance,
  MarketInfo,
  PositionBalance,
  SimpleBalance,
  Winnings,
} from '../types';
import { formatDai } from '../../utils/format-number';
import { useActiveWeb3React } from '../ConnectAccount/hooks';
import { USDC } from '../constants';
import { useAppStatusStore } from '../stores/app-status';

interface PositionsTableProps {
  market: MarketInfo;
  ammExchange: AmmExchange;
  positions: PositionBalance[];
  claimableWinnings?: Winnings;
  singleMarket?: boolean;
}

interface LiquidityTableProps {
  market: MarketInfo;
  ammExchange: AmmExchange;
  lpTokens?: SimpleBalance;
  singleMarket?: boolean;
}

const MarketTableHeader = ({
  market,
  ammExchange,
}: {
  market: MarketInfo;
  ammExchange: AmmExchange;
}) => {
  return (
    <div className={Styles.MarketTableHeader}>
      <span>{market.description}</span>
      {ammExchange.cash.symbol === USDC ? UsdIcon : EthIcon}
    </div>
  );
};

const PositionHeader = () => {
  const { isMobile } = useAppStatusStore();
  return (
    <ul className={Styles.PositionHeader}>
      <li>outcome</li>
      <li>
        {isMobile ? (
          <>
            qty
            <br />
            owned
          </>
        ) : (
          'quantity owned'
        )}
      </li>
      <li>
        {isMobile ? (
          <>
            avg.
            <br />
            price
          </>
        ) : (
          'avg. price paid'
        )}
      </li>
      <li>init. value</li>
      <li>cur.{isMobile ? <br /> : ' '}value</li>
      <li>p/l</li>
    </ul>
  );
};

const PositionRow = ({ position }: { position: PositionBalance }) => {
  return (
    <ul className={Styles.PositionRow}>
      <li>{position.outcomeName}</li>
      <li>{position.quantity}</li>
      <li>{position.avgPrice}</li>
      <li>{formatDai(position.initCostUsd).full}</li>
      <li>{formatDai(position.usdValue).full}</li>
      <li>{position.totalChangeUsd}</li>
    </ul>
  );
};

interface PositionFooterProps {
  claimableWinnings?: Winnings;
}
export const PositionFooter = ({ claimableWinnings }: PositionFooterProps) => {
  const { isMobile } = useAppStatusStore();
  if (isMobile && !claimableWinnings) return null;
  return (
    <div className={Styles.PositionFooter}>
      {claimableWinnings && (
        <SecondaryButton
          text={`${claimableWinnings.claimableBalance} in Winnings to claim`}
        />
      )}
      {!isMobile && <PrimaryButton text="trade" />}
    </div>
  );
};

export const AllPositionTable = () => {
  const {
    userInfo: {
      balances: { marketShares },
    },
  } = useAppStatusStore();
  const positions = marketShares
    ? ((Object.values(marketShares) as unknown[]) as {
        ammExchange: AmmExchange;
        positions: PositionBalance[];
        claimableWinnings: Winnings;
      }[])
    : [];

  const positionVis = positions.map((position) => {
    return (
      <PositionTable
        market={position.ammExchange.market}
        ammExchange={position.ammExchange}
        positions={position.positions}
        claimableWinnings={position.claimableWinnings}
      />
    );
  });

  return <>{positionVis}</>;
};

export const PositionTable = ({
  market,
  ammExchange,
  positions,
  claimableWinnings,
  singleMarket,
}: PositionsTableProps) => {
  return (
    <div className={Styles.PositionTable}>
      {!singleMarket && (
        <MarketTableHeader market={market} ammExchange={ammExchange} />
      )}
      <PositionHeader />
      {positions &&
        positions
          .filter((p) => p.visible)
          .map((position, id) => <PositionRow key={id} position={position} />)}
      {!singleMarket && (
        <PositionFooter claimableWinnings={claimableWinnings} />
      )}
      {singleMarket && <div className={Styles.PaginationFooter} />}
    </div>
  );
};

const LiquidityHeader = () => {
  const { isMobile } = useAppStatusStore();
  return (
    <ul className={Styles.LiquidityHeader}>
      <li>liquidity shares{isMobile ? <br /> : ' '}owned</li>
      <li>init.{isMobile ? <br /> : ' '}value</li>
      <li>cur.{isMobile ? <br /> : ' '}value</li>
      <li>fees{isMobile ? <br /> : ' '}earned</li>
    </ul>
  );
};

const LiquidityRow = ({ liquidity }: { liquidity: LPTokenBalance }) => {
  return (
    <ul className={Styles.LiquidityRow}>
      <li>{liquidity.balance}</li>
      <li>{formatDai(liquidity.initCostUsd).full}</li>
      <li>{liquidity.usdValue ? formatDai(liquidity.usdValue).full : '-'}</li>
      <li>{liquidity.feesEarned ? liquidity.feesEarned : '-'}</li>
    </ul>
  );
};

export const LiquidityFooter = () => {
  return (
    <div className={Styles.LiquidityFooter}>
      <PrimaryButton text="remove liquidity" />
      <SecondaryButton text="add liquidity" />
    </div>
  );
};

export const AllLiquidityTable = () => {
  const {
    processed,
    userInfo: {
      balances: { lpTokens },
    },
  } = useAppStatusStore();
  const { ammExchanges } = processed;
  const liquidities = lpTokens
    ? Object.keys(lpTokens).map((ammId) => ({
        ammExchange: ammExchanges[ammId],
        market: ammExchanges[ammId].market,
        lpTokens: lpTokens[ammId],
      }))
    : [];
  const liquiditiesViz = liquidities.map((liquidity) => {
    return (
      <LiquidityTable
        market={liquidity.market}
        ammExchange={liquidity.ammExchange}
        lpTokens={liquidity.lpTokens}
      />
    );
  });

  return <>{liquiditiesViz}</>;
};

export const LiquidityTable = ({
  market,
  ammExchange,
  lpTokens,
}: LiquidityTableProps) => {
  return (
    <div className={Styles.LiquidityTable}>
      <MarketTableHeader market={market} ammExchange={ammExchange} />
      <LiquidityHeader />
      {lpTokens && <LiquidityRow liquidity={lpTokens} />}
      <LiquidityFooter />
    </div>
  );
};

interface PositionsLiquidityViewSwitcherProps {
  ammExchange?: AmmExchange;
  showActivityButton?: boolean;
  setActivity?: Function;
  setTables?: Function;
}

export const PositionsLiquidityViewSwitcher = ({
  ammExchange,
  showActivityButton,
  setActivity,
  setTables,
}: PositionsLiquidityViewSwitcherProps) => {
  const [tableView, setTableView] = useState(POSITIONS);
  const {
    processed,
    userInfo: {
      balances: { lpTokens, marketShares },
    },
  } = useAppStatusStore();
  const { ammExchanges } = processed;

  const ammId = ammExchange?.id;
  let userPositions = [];
  let liquidity = null;
  let winnings = null;
  if (ammId && marketShares) {
    userPositions = marketShares[ammId] ? marketShares[ammId].positions : [];
    liquidity = lpTokens[ammId] ? lpTokens[ammId] : null;
    winnings = marketShares[ammId]
      ? marketShares[ammId]?.claimableWinnings
      : null;
  }
  const market = ammExchange?.market;

  const positions = marketShares
    ? ((Object.values(marketShares) as unknown[]) as {
        ammExchange: AmmExchange;
        positions: PositionBalance[];
        claimableWinnings: Winnings;
      }[])
    : [];
  const liquidities = lpTokens
    ? Object.keys(lpTokens).map((ammId) => ({
        ammExchange: ammExchanges[ammId],
        market: ammExchanges[ammId].market,
        lpTokens: lpTokens[ammId],
      }))
    : [];
  return (
    <div className={Styles.PositionsLiquidityViewSwitcher}>
      <div>
        <span
          onClick={() => {
            setTables && setTables();
            setTableView(POSITIONS);
          }}
          className={classNames({
            [Styles.Selected]: tableView === POSITIONS,
          })}
        >
          {POSITIONS}
        </span>
        <span
          onClick={() => {
            setTables && setTables();
            setTableView(LIQUIDITY);
          }}
          className={classNames({
            [Styles.Selected]: tableView === LIQUIDITY,
          })}
        >
          {LIQUIDITY}
        </span>
        {showActivityButton && (
          <TinyButton
            action={() => {
              setTableView(null);
              setActivity();
            }}
            text="your activity"
            selected={tableView === null}
          />
        )}
      </div>
      {tableView !== null && (positions.length > 0 || liquidities.length > 0) && (
        <div>
          {!ammId && (
            <>
              {tableView === POSITIONS && <AllPositionTable />}
              {tableView === LIQUIDITY && <AllLiquidityTable />}
              <Pagination
                page={1}
                itemCount={10}
                itemsPerPage={9}
                action={() => null}
                updateLimit={() => null}
              />
            </>
          )}
          {ammId && (
            <>
              {tableView === POSITIONS && userPositions.length > 0 && (
                <PositionTable
                  singleMarket
                  market={market}
                  ammExchange={ammExchange}
                  positions={userPositions}
                  claimableWinnings={winnings}
                />
              )}
              {tableView === LIQUIDITY && liquidity.length > 0 && (
                <LiquidityTable
                  singleMarket
                  market={market}
                  ammExchange={ammExchange}
                  lpTokens={liquidity}
                />
              )}
            </>
          )}
        </div>
      )}
      {(positions.length === 0 || (ammId && userPositions.length === 0)) &&
        tableView === POSITIONS && <span>No positions to show</span>}
      {(liquidities.length === 0 || (ammId && liquidity.length === 0)) &&
        tableView === LIQUIDITY && <span>No liquidity to show</span>}
    </div>
  );
};

const TransactionsHeader = () => {
  const [selectedType, setSelectedType] = useState(ALL);
  const { isMobile } = useAppStatusStore();
  return (
    <ul className={Styles.TransactionsHeader}>
      <li>
        {isMobile ? (
          <SmallDropdown
            onChange={(value) => setSelectedType(value)}
            options={[
              { label: ALL, value: 0 },
              { label: SWAP, value: 1 },
              { label: ADD, value: 2 },
              { label: REMOVE, value: 3 },
            ]}
            defaultValue={ALL}
          />
        ) : (
          <>
            <span
              className={classNames({
                [Styles.Selected]: selectedType === ALL,
              })}
              onClick={() => setSelectedType(ALL)}
            >
              all
            </span>
            <span
              className={classNames({
                [Styles.Selected]: selectedType === SWAP,
              })}
              onClick={() => setSelectedType(SWAP)}
            >
              swaps
            </span>
            <span
              className={classNames({
                [Styles.Selected]: selectedType === ADD,
              })}
              onClick={() => setSelectedType(ADD)}
            >
              adds
            </span>
            <span
              className={classNames({
                [Styles.Selected]: selectedType === REMOVE,
              })}
              onClick={() => setSelectedType(REMOVE)}
            >
              removes
            </span>
          </>
        )}
      </li>
      <li>total value</li>
      <li>token amount</li>
      <li>share amount</li>
      <li>account</li>
      <li>time</li>
    </ul>
  );
};

const AccountLink = ({ account }) => {
  // TODO: make this a etherscan link
  return (
    <span>
      {account && account.slice(0, 6) + '...' + account.slice(38, 42)}
    </span>
  );
};

interface TransactionProps {
  transaction: AmmTransaction;
}

const TransactionRow = ({ transaction }: TransactionProps) => {
  return (
    <ul className={Styles.TransactionRow}>
      <li>{transaction.subheader}</li>
      <li>{formatDai(transaction.value).full}</li>
      <li>{transaction.tokenAmount}</li>
      <li>{transaction.shareAmount}</li>
      <li>
        <AccountLink account={transaction.sender} />
      </li>
      <li>{transaction.time}</li>
    </ul>
  );
};

interface TransactionsProps {
  transactions: AmmTransaction[];
}

export const TransactionsTable = ({ transactions }: TransactionsProps) => {
  return (
    <div className={Styles.TransactionsTable}>
      {transactions?.length > 0 ? (
        <>
          <TransactionsHeader />
          {transactions.map((transaction) => (
            <TransactionRow key={transaction.id} transaction={transaction} />
          ))}
          <div className={Styles.PaginationFooter}>
            <Pagination
              page={1}
              itemCount={10}
              itemsPerPage={9}
              action={() => null}
              updateLimit={() => null}
            />
          </div>
        </>
      ) : (
        <span>No transactions to show</span>
      )}
    </div>
  );
};
