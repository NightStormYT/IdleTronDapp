import React from 'react';
import TronLinkGuide from 'components/TronLinkGuide';
import TronWeb from 'tronweb';
import Utils from 'utils';
import Swal from 'sweetalert2';


import './App.scss';

const FOUNDATION_ADDRESS = 'TWiWt5SEDzaEqS6kE5gandWMNfxR2B5xzg';

////////////////////////////////////////////////////////////////////////////////////
const contractAddress = 'TRi54MRJgohaA1yiFesZAY1NKYey9HJcLv';   /// Add your contract address here
////////////////////////////////////////////////////////////////////////////////////

class App extends React.Component {


    constructor(props) {
        super(props);

        this.state = {
            buyValue: 10,
            playerAddress: 'yes',
            tempAddress: 'plz',
            originalPlayer: 'wow',

            tronWeb: {
              installed: false,
              loggedIn: false
            },
        }
        this.init = this.init.bind(this)
        this.updateBuyValue = this.updateBuyValue.bind(this)

        this.buyTron = this.buyTron.bind(this);
        this.getTronBalance = this.getTronBalance.bind(this);
        this.getTron2Balance = this.getTron2Balance.bind(this);
        this.getMicroTronBalance = this.getMicroTronBalance.bind(this);
        this.getContractBalance = this.getContractBalance.bind(this);
        this.microTronToTron = this.microTronToTron.bind(this);
        this.updatePlayerAddressInput = this.updatePlayerAddressInput.bind(this);
        this.returnHome = this.returnHome.bind(this);
        this.onOtherPlayer = this.onOtherPlayer.bind(this);
    }

    async componentDidMount() {

        this.setState({loading:true})
        await new Promise(resolve => {
            const tronWebState = {
                installed: !!window.tronWeb,
                loggedIn: window.tronWeb && window.tronWeb.ready
            };

            if(tronWebState.installed) {
                this.setState({
                    tronWeb:
                    tronWebState
                });

                return resolve();
            }

            let tries = 0;

            const timer = setInterval(() => {
                if(tries >= 10) {
                    const TRONGRID_API = 'https://api.trongrid.io';

                    window.tronWeb = new TronWeb(
                        TRONGRID_API,
                        TRONGRID_API,
                        TRONGRID_API
                    );

                    this.setState({
                        tronWeb: {
                            installed: false,
                            loggedIn: false
                        }
                    });

                    clearInterval(timer);
                    return resolve();
                }

                tronWebState.installed = !!global.tronWeb;
                tronWebState.loggedIn = window.tronWeb && window.tronWeb.ready;

                if(!tronWebState.installed)
                    return tries++;

                this.setState({
                    tronWeb: tronWebState
                });

                resolve();
            }, 100);
        });

        if(!this.state.tronWeb.loggedIn) {
            // Set default address (foundation address) used for contract calls
            // Directly overwrites the address object as TronLink disabled the
            // function call
            window.tronWeb.defaultAddress = {
                hex: global.tronWeb.address.toHex(FOUNDATION_ADDRESS),
                base58: FOUNDATION_ADDRESS
            };

            window.tronWeb.on('addressChanged', () => {
                if(this.state.tronWeb.loggedIn)
                    return;

                this.setState({
                    tronWeb: {
                        installed: true,
                        loggedIn: true
                    }
                });
            });
        }

        await Utils.setTronWeb(window.tronWeb, contractAddress);
        const playerAddress2 = await Utils.contract.getPlayerAddress().call();
        this.setState({playerAddress: playerAddress2});
        this.setState({originalPlayer: playerAddress2});
        const temp3 = window.tronWeb.address.fromHex((this.state.originalPlayer).toString());
        document.getElementById("productionText3").innerHTML = "Current Player: " + temp3;
        //console.log(await this.state.tronWeb.address.fromHex((this.state.playerAddress).toString()));
        //this.getContractBalance();
        this.init();
    }

    init()
    {
        this.getContractBalance();
    }

    openSearch()
    {
        document.getElementById("player-search").style.display = "block";
    }

    closeSearch()
    {
        document.getElementById("player-search").style.display = "none";
    }

    searchThatPlayer()
    {
        const temp3 = window.tronWeb.address.fromHex((this.state.tempAddress).toString())
        this.setState({playerAddress: temp3});
    }

    async getContractBalance()
    {
        const bal = (await Utils.contract.getContractBalance().call()).toNumber();

        if (bal > 1000)
        {
            const exponent = (Math.floor(Math.log10(Math.abs(bal))));
            const mantissa = (bal / Math.pow(10, exponent));
            document.getElementById("contractBal").innerHTML = "Contract Balance " + mantissa.toFixed(2) + "e" + exponent + " TRX";
        }
        else
            document.getElementById("contractBal").innerHTML = "Contract Balance " + bal + " TRX";

        const temp3 = window.tronWeb.address.fromHex((this.state.playerAddress).toString());
        document.getElementById("productionText3").innerHTML = "Current Player: " + temp3;


        this.getTronBalance();
    }

    async getTronBalance()
    {
        const playerAd3 = await Utils.contract.getPlayerAddress().call();
        console.log(playerAd3);
        console.log(this.state.playerAddress);
        const bal = (await Utils.contract.getBalance(this.state.playerAddress).call()).toNumber();

        if (bal > 1000)
        {
            const exponent = (Math.floor(Math.log10(Math.abs(bal))));
            const mantissa = (bal / Math.pow(10, exponent));
            document.getElementById("tron").innerHTML = mantissa.toFixed(2) + "e" + exponent;
        }
        else
            document.getElementById("tron").innerHTML = bal;

        this.getTron2Balance();
    }

    async getTron2Balance()
    {
        const bal = (await Utils.contract.getMyTron2(this.state.playerAddress).call()).toNumber();
        const production = bal * 5;

        const temp1 = (production / 100);
        const temp2 = ((((production / 100) * 100) - ((production / 100) * 0.05) * 100) / 1000000);

        if (temp1 > 1000)
        {
            const exponent = (Math.floor(Math.log10(Math.abs(temp1))));
            const mantissa = (temp1 / Math.pow(10, exponent));
            document.getElementById("productionText").innerHTML = "~" + mantissa.toFixed(2) + "e" + exponent + " MicroTron per Second";
        }
        else
            document.getElementById("productionText").innerHTML = "~"  + temp1.toFixed(2) + " MicroTron per Second";

        if (temp2 > 1000)
        {
            const exponent = (Math.floor(Math.log10(Math.abs(temp2))));
            const mantissa = (temp2 / Math.pow(10, exponent));
            document.getElementById("productionText2").innerHTML = "~" + mantissa.toFixed(2) + "e" + exponent + " TRX per Second";
        }
        else
            document.getElementById("productionText2").innerHTML = "~"  + temp2.toFixed(8) + " TRX per Second";

        if (bal > 1000)
        {
            const exponent = (Math.floor(Math.log10(Math.abs(bal))));
            const mantissa = (bal / Math.pow(10, exponent));
            document.getElementById("tron2").innerHTML = mantissa.toFixed(2) + "e" + exponent;
        }
        else
            document.getElementById("tron2").innerHTML = bal;

        this.getMicroTronBalance();
    }

    async getMicroTronBalance()
    {
        const bal = (await Utils.contract.getMyMicroTron(this.state.playerAddress).call()).toNumber();

        if (bal > 1000)
        {
            const exponent = (Math.floor(Math.log10(Math.abs(bal))));
            const mantissa = (bal / Math.pow(10, exponent));
            document.getElementById("microTron").innerHTML = mantissa.toFixed(2) + "e" + exponent;
        }
        else
            document.getElementById("microTron").innerHTML = bal;

        this.microTronToTron();
    }

    async microTronToTron()
    {
        const bal = (await Utils.contract.microTronToTron(this.state.playerAddress).call()).toNumber();

        if (bal > 1000)
        {
            const exponent = (Math.floor(Math.log10(Math.abs(bal))));
            const mantissa = (bal / Math.pow(10, exponent));
            document.getElementById("microTronToTron").innerHTML = "Sell MicroTron for " + mantissa.toFixed(2) + "e" + exponent + " TRX";
        }
        else
            document.getElementById("microTronToTron").innerHTML = "Sell MicroTron for " + bal + " TRX";

        this.onOtherPlayer();
    }

    async updateBuyValue (evt)
    {
        if (evt.target.value < 10)
            evt.target.value = 10
        await this.setState({
            buyValue: evt.target.value
        });
    }

    async onOtherPlayer()
    {
        console.log("player: " + this.state.playerAddress);
        console.log("orig: " + this.state.originalPlayer);

        const playerAddress2 = await Utils.contract.getPlayerAddress().call();
        console.log("three: " + playerAddress2);
        if (this.state.playerAddress != this.state.originalPlayer)
        {
            document.getElementById("homeButtonSearch").style.display = "block";
            document.getElementById("searchButton2").style.display = "block";
            document.getElementById("otherButtons").style.display = "none";
        }
        else
        {
            document.getElementById("homeButtonSearch").style.display = "none";
            document.getElementById("searchButton2").style.display = "none";
            document.getElementById("otherButtons").style.display = "block";
        }
        this.getContractBalance();
    }

    async returnHome()
    {
        const temp3 = window.tronWeb.address.fromHex(this.state.originalPlayer).toString();

        await this.setState({playerAddress: this.state.originalPlayer});
    }

    async updatePlayerAddressInput()
    {
        const tempAddPlayer = document.getElementById("searchThePlayer").value
        await this.setState({tempAddress: tempAddPlayer});
        // TLVQYYQBHcDvYCJkdZizJviDocePbPTjod
    }

    async buyTron()
    {
        const { value } = await Swal({
                    title: 'Buy Tron²',
                    text: 'Enter Tron² amount in TRX',
                    confirmButtonText: 'Buy',
                    input: 'text',
                    showCancelButton: true,
                    showLoaderOnConfirm: true,
                    reverseButtons: true,
                    allowOutsideClick: () => !Swal.isLoading(),
                    allowEscapeKey: () => !Swal.isLoading(),
                    preConfirm: amount => {
                        if(isNaN(amount) || amount <= 0) {
                            Swal.showValidationMessage('Invalid Tron² amount provided');
                            return false;
                        }
                        return Utils.contract.buyTron2(this.state.playerAddress).send({
                            callValue: Number(amount) * 1000000
                            }).then(res => Swal({
                                title: 'Purchase Sucessful!',
                                type: 'success'
                            })).catch(err => Swal({
                                title: 'Purchase Failed.',
                                type: 'error',
                        }));
                    }
                });
        this.getContractBalance();
    }

    async sellTron()
    {
        Utils.contract.sellMicroTron(this.state.playerAddress).send();
    }

    render() {
        if(!this.state.tronWeb.installed)
            return <TronLinkGuide />;

        if(!this.state.tronWeb.loggedIn)
            return <TronLinkGuide installed />;

        return (

            <div className='rw'>
                    <img id="bgBottom" alt='some value' src="IdleTronWebBottom.png"></img>
                    <img id="bgTop" alt='some value' src="IdleTronWebTop.png"></img>
                <div className="gameHeader">
                    <div id="headerTitle">
                        <p className="gameTitle">Idle Tron</p>
                        <p id="contractBal">Contract Balance: 0 TRX</p>
                    </div>

                    <div className="headSpacer">
                    </div>
                    <div id="headerTitle2">
                        <p id="tron">
                            0
                        </p>
                        <br></br>
                        <p id="headerTitle3">
                            TRX
                        </p>
                    </div>
                    <div id="headerTitle2">
                        <p id="tron2">
                            0
                        </p>
                        <br></br>
                        <p id="headerTitle3">
                            Tron²
                        </p>
                    </div>
                    <div id="headerTitle2">
                        <p id="microTron">
                            0
                        </p>
                        <br></br>
                        <p id="headerTitle3">
                            MicroTron
                        </p>
                    </div>
                    <div id="headerTitle2">
                        <button className="buyMicroTronButton2 updateBalance" onClick={(event) => {event.preventDefault(); this.init();}}>
                            Update Balances
                        </button>
                    </div>
                </div>


                <div className='text-center'>
                    <hr/>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                    <span id="getTron"></span>
                    <br></br>
                        <br></br>

                <button className="buyMicroTron2Button2" id="homeButtonSearch" onClick={(event) => {event.preventDefault(); this.returnHome();}}>
                    Back
                </button>
                        <p id="productionText3">
                            Current Player: Tx
                        </p>
                        <p id="productionText">
                            0 MicroTron per Second
                        </p>
                        <p id="productionText2">
                            0.0000000 TRX per Second
                        </p>

                        <br></br>
                        <br></br>
                    <center>
                    <div id="otherButtons">
                        <div className="buySell">
                            1 Tron = 0.95 Tron²
                            <br></br>
                            <br></br>
                            <button className="buyMicroTronButton" onClick={(event) => {event.preventDefault(); this.buyTron();}}>
                                Buy Tron²
                            </button>
                        </div>
                        <div className="buySell">
                            1e4 MicroTron = 0.95 Tron
                            <br></br>
                            <br></br>
                            <button className="buyMicroTronButton" onClick={(event) => {event.preventDefault(); this.sellTron();}}>
                                <p id="microTronToTron">
                                    Sell MicroTron for 0 TRX
                                </p>
                            </button>
                        </div>
                        <div className="buySell">
                            See someone else's progress
                            <br></br>
                            <br></br>
                            <button className="buyMicroTronButton" onClick={(event) => {event.preventDefault(); this.openSearch();}}>
                                Search Player
                            </button>
                        </div>
                    </div>
                    <br></br>
                    <div id="searchButton2">
                        See someone else's progress
                        <br></br>
                        <br></br>
                        <button className="buyMicroTronButton" onClick={(event) => {event.preventDefault(); this.openSearch();}}>
                            Search Player
                        </button>
                    </div>
                    </center>
                    <div id="player-search">

                        <button className="buyMicroTronButton4" onClick={(event) => {event.preventDefault(); this.closeSearch();}}>
                            Back
                        </button>
                        <br></br>
                        <br></br>
                        <br></br>
                        <p id="productionText2">Search a player:</p>

                        <br></br>
                        <input className="css-input" id="searchThePlayer" placeholder="Enter Address" onChange={this.updatePlayerAddressInput}/>
                        <button className="buyMicroTronButton5" onClick={(event) => {event.preventDefault(); this.searchThatPlayer();}}>
                            Search Player
                        </button>
                        <br></br>
                        <br></br>
                        <button className="buyMicroTronButton5" onClick={(event) => {event.preventDefault(); this.openSearch();}}>
                            Random Player
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;

