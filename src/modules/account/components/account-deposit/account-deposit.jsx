import React, { Component } from 'react'
import PropTypes from 'prop-types'
import QRCode from 'qrcode.react'
import Clipboard from 'clipboard'
import TextFit from 'react-textfit'

import { augur } from 'services/augurjs'
import { Deposit as DepositIcon, Copy as CopyIcon } from 'modules/common/components/icons'

import Styles from 'modules/account/components/account-deposit/account-deposit.styles'

function airSwapOnClick(e) {
  e.preventDefault()
  window.AirSwap.Trader.render({
    mode: 'buy',
    token: '0xe94327d07fc17907b4db788e5adf2ed424addff6',
    onCancel() {
      console.info('AirSwap trade cancelled')
    },
    onComplete(txid) {
      console.info('AirSwap complete', txid)
    },
  }, document.getElementById('app'))
}

function shapeShiftOnClick(e) {
  e.preventDefault()
  const link=e.target.value
  window.open(link, '1418115287605', 'width=700,height=500,toolbar=0,menubar=0,location=0,status=1,scrollbars=1,resizable=0,left=0,top=0')
}

export default class AccountDeposit extends Component {
  static propTypes = {
    address: PropTypes.string.isRequired,
  }

  componentDidMount() {
    const clipboard = new Clipboard('#copy_address') // eslint-disable-line
  }

  render() {
    const { address } = this.props
    const noFeeTextStyle = { 'font-weight': '400' }
    const styleQR = {
      height: 'auto',
      width: '100%',
    }
    let airSwapConverter = <a href="" onClick={e => airSwapOnClick(e)}> Use AirSwap <span style={noFeeTextStyle}>(no fees)</span> </a>
    let shapeShiftConverter = <a href="https://shapeshift.io" rel="noopener noreferrer" target="_blank">Use Shapeshift</a>
    if (parseInt(augur.rpc.getNetworkID(), 10) === 1) {
      shapeShiftConverter = (
        <div className={Styles.AccountDeposit__shapeShiftButton}>
          <button
            onClick={e => shapeShiftOnClick(e)}
            value={'https://shapeshift.io/shifty.html?destination=' + address + '&output=ETH'}
          >
            ShapeShift to ETH
          </button>
          <button
            onClick={e => shapeShiftOnClick(e)}
            value={'https://shapeshift.io/shifty.html?destination=' + address + '&output=REP'}
          >
            ShapeShift to REP
          </button>
        </div>
      )
      airSwapConverter = (
        <div className={Styles.AccountDeposit__shapeShiftButton}>
          <button
            onClick={e => airSwapOnClick(e)}
            value={'https://shapeshift.io/shifty.html?destination=' + address + '&output=REP'}
          >
            AirSwap to REP <span style={noFeeTextStyle}>(no fees)</span>
          </button>
        </div>
      )
    }

    return (
      <section className={Styles.AccountDeposit}>
        <div className={Styles.AccountDeposit__heading}>
          <h1>Account: Deposit</h1>
          { DepositIcon }
        </div>
        <div className={Styles.AccountDeposit__main}>
          <div className={Styles.AccountDeposit__description}>
            <p>
              DO NOT send real ETH or REP to this account. Augur is currently on Ethereum&#39;s Rinkeby testnet.
            </p>
            {airSwapConverter}
            <div />
            {shapeShiftConverter}
          </div>
          <div className={Styles.AccountDeposit__address}>
            <h3 className={Styles.AccountDeposit__addressLabel}>
                Public Account Address
            </h3>
            <TextFit mode="single" max={18}>
              <button
                id="copy_address"
                className={Styles.AccountDeposit__copyButtonElement}
                data-clipboard-text={address}
              >
                <span className={Styles.AccountDeposit__addressString}>
                  {address}
                </span>
                {CopyIcon}
              </button>
            </TextFit>
          </div>
          <div>
            <QRCode
              value={address}
              style={styleQR}
            />
          </div>
        </div>
      </section>
    )
  }
}
