import React, { useState } from 'react';
import classNames from 'classnames';

import Styles from 'modules/portfolio/components/portfolio-view/my-bets.styles.less';
import { ExternalLinkButton, PrimaryButton } from 'modules/common/buttons';
import { PillSelection, SquareDropdown } from 'modules/common/selection';
import FilterSearch from 'modules/filter-sort/containers/filter-search';
import { HelmetTag } from 'modules/seo/helmet-tag';
import { PORTFOLIO_VIEW_HEAD_TAGS } from 'modules/seo/helmet-configs';
import {
  SPORTS_MARKET_TYPES,
  MY_BETS_VIEW_BY,
  MY_BETS_MARKET_STATUS,
  INVALID_BEST_BID_ALERT_VALUE,
  MY_BETS_BET_DATE,
} from 'modules/common/constants';
import { MARKETS } from 'modules/routes/constants/views';
import { FilterNotice } from 'modules/common/filter-notice';
import { EmptyMagnifyingGlass } from 'modules/common/icons';
import { MOCK_GAMES_DATA } from 'modules/trading/store/constants';
import { Game } from '../common/common';

export const MyBets = () => {
  const [state, setState] = useState({
    selectedMarketCardType: 0,
    viewBy: MY_BETS_VIEW_BY[0].value,
    marketStatus: MY_BETS_MARKET_STATUS[0].value,
    betDate: MY_BETS_BET_DATE[0].value,
    rows: MOCK_GAMES_DATA,
  });

  const { selectedMarketCardType, viewBy, marketStatus, betDate, rows } = state;

  return (
    <div className={classNames(Styles.MyBets)}>
      <HelmetTag {...PORTFOLIO_VIEW_HEAD_TAGS} />
      <div>
        <div>
          <span>My Bets</span>
          <span>To view your unmatched bets, go to Trading.</span>
          <ExternalLinkButton
            condensedStyle
            customLink={{
              pathname: MARKETS,
            }}
            label={'go to trading'}
          />
        </div>
        <FilterNotice
          showDismissButton={false}
          show
          color="active"
          content={
            <div className={Styles.ClaimWinnings}>
              You have <b>$200.00</b> in winnings to claim.
              <PrimaryButton text={'Claim Bets'} action={null} />
            </div>
          }
        />
        <div>
          <span>
            View by{' '}
            <SquareDropdown
              options={MY_BETS_VIEW_BY}
              defaultValue={MY_BETS_VIEW_BY[0].value}
              onChange={selected => setState({ ...state, viewBy: selected })}
              minimalStyle
            />
          </span>
          <span>
            Market Status:{' '}
            <SquareDropdown
              options={MY_BETS_MARKET_STATUS}
              defaultValue={MY_BETS_MARKET_STATUS[0].value}
              onChange={selected =>
                setState({ ...state, marketStatus: selected })
              }
              minimalStyle
            />
          </span>
        </div>
        <PillSelection
          options={SPORTS_MARKET_TYPES}
          defaultSelection={selectedMarketCardType}
          large
          onChange={selected =>
            setState({ ...state, selectedMarketCardType: selected })
          }
        />
        <FilterSearch
          placeholder={'Search markets & outcomes...'}
          search=""
          isSearchingMarkets={false}
        />
      </div>
      <div>
        {rows.length === 0 && (
          <section>
            {EmptyMagnifyingGlass}
            <span>No events found</span>
            <span>
              Try a different date range. <b>Clear Filter</b>
            </span>
          </section>
        )}
        {rows.length > 0 && rows.map(row => <Game row={row} />)}
      </div>
    </div>
  );
};
