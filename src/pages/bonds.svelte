<script>
import { getNotificationsContext } from "svelte-notifications"
const { addNotification } = getNotificationsContext();

export let account
export let token
export let signer
export let provider
export let connected
export let wojak
export let stake
export let nonce

const unlimited = "0xffffffffffffffffffffffffffffffffffffffffffffffffff"

let price = 0, bondPrice = 0, sum = 0,
    USDC_holdings = 0.0,
    USDC_allowance = ethers.utils.parseEther("0"),
    USDCInput, usdcCollected = 0, availPurchase = 0, bonded, maxBought = 0

let bonds, USDC

window.dispatch = () => getAccount()
if(connected) getAccount()

let 
    timeleft = {days: -1, hours:-1,minutes:-1,seconds:-1}, timestamp = 0,
    Chads = 0

function getAccount() {
    bonds = new ethers.Contract(token.contracts.bonds.address, token.contracts.bonds.abi, signer)
    const pair = new ethers.Contract(token.swap.pair.address, token.swap.pair.abi, signer)
    USDC = new ethers.Contract(token.tokens.usdc.address, token.tokens.usdc.abi, signer)

    let collector = []

    collector[0] = USDC.balanceOf(account.address)
    collector[1] = USDC.allowance(account.address, token.contracts.bonds.address)
    
    collector[2] = bonds.bondPrice()
    collector[3] = pair.getReserves()
    collector[4] = bonds.timeleft(account.address)
    collector[5] = bonds.balanceOf(account.address)
    collector[6] = bonds.usdcCollected()
    collector[7] = wojak.balanceOf(token.contracts.bonds.address)
    collector[8] = bonds.bonded()

    Promise.all(collector).then(values => {
        USDC_holdings = ethers.utils.formatUnits(values[0], 6)
        USDC_allowance = values[1]
        
        bondPrice = ethers.utils.formatUnits(values[2], 18)
        const res = values[3]
        price = parseFloat(ethers.utils.formatUnits(res[0], token.tokens.usdc.decimals)) / parseFloat(ethers.utils.formatUnits(res[1], 18))
        timestamp = parseInt(values[4])
        Chads = parseFloat(ethers.utils.formatEther(values[5]))
        usdcCollected = ethers.utils.formatUnits(values[6].toString(), token.tokens.usdc.decimals)
        availPurchase = ethers.utils.formatEther(values[7])
        bonded = ethers.utils.formatEther(values[8])
        const tmp = (parseFloat(ethers.utils.formatEther(values[7])) * price)
        maxBought = tmp - (tmp / 5)
    })
}

setInterval(() => {
    timeleft = getTimeRemaining(timestamp)
})

function getTimeRemaining(endtime){
    if(Math.round(new Date() / 1000) < endtime) {
        const total = endtime - Math.round(new Date() / 1000);

        return {
            total,
            days: Math.floor( total/(60*60*24) ),
            hours: Math.floor( (total/(60*60)) % 24 ),
            minutes: Math.floor( (total/60) % 60 ),
            seconds: Math.floor( (total) % 60 )
        }
    }else{
        return {
            total: 0,
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        }
    }
}

function buypower() {
    const USDCAmount = parseFloat(USDCInput.value)
    sum = USDCAmount / (bondPrice - (bondPrice / 5))
}
let approveUSDC
async function approve() {
    if(!connected) return processError({message:"Wallet is not connected"}, true)
    if(approveUSDC.value.length == 0) return processError({message:"You must enter an amount of USDC you'd like to approve"}, true)

    try {
        const tx = await USDC.approve(token.contracts.bonds.address, ethers.utils.parseUnits(approveUSDC.value, 18))
        notify("Transaction processing", "warning")
        await tx.wait()
        notify("Transaction successful", "success")
    } catch (error) {processError(error)}
}

async function approveUnlimited() {
    if(!connected) return processError({message:"Wallet is not connected"}, true)

    try {
        const tx = await USDC.approve(token.contracts.bonds.address, "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
        notify("Transaction processing", "warning")
        await tx.wait()
        notify("Transaction successful", "success")
    } catch (error) {processError(error)}
}

async function bond() {
    if(!connected) return processError({message:"Wallet is not connected"}, true)
    if(USDCInput.value.length == 0) return processError({message:"You must enter an amount of USDC you'd like to bond"}, true)

    try {
        const wjkAmount = ethers.utils.parseEther((parseFloat(USDCInput.value) / (bondPrice - (bondPrice / 5))).toString())
        notify("Transaction processing", "warning")
        const tx = await bonds.bond(wjkAmount)
        await tx.wait()
        notify("Transaction successful", "success")
    } catch (error) {
        if(error.data.message == "VM Exception while processing transaction: revert !availableBonds") {
            addNotification({
                text: "Not enough available bonds",
                position: "bottom-left",
                type: "danger",
                removeAfter: 4000
            })
        }else processError(error)}
}

let errorClaiming = ""
async function claimAll() {
    if(!connected) return processError({message:"Wallet is not connected"}, true)
    if(Chads == 0) return processError({message:"You don't have enough \$CHAD"}, true)

    try {
        const tx = await bonds.claimBond()
        notify("Transaction processing", "warning")
        await tx.wait()
        notify("Transaction successful", "success")
    } catch (error) {
        if(error.data.message == "VM Exception while processing transaction: revert You cannot claim bond yet") {
            addNotification({
                text: "You cannot claim bond yet",
                position: "bottom-left",
                type: "danger",
                removeAfter: 4000
            })
        }else processError(error)}
}

function notify(message, type) {
    addNotification({
        text: message,
        position: "bottom-left",
        type,
        removeAfter: 4000
    })
}

function processError(error, dontPreprocess) {
    let json = error
    console.log(error.data.message)
    if(dontPreprocess == null) json = JSON.parse(error.message.toString().split("error=")[1].split(", method=")[0])
    addNotification({
        text: json.message,
        position: "bottom-left",
        type: "danger",
        removeAfter: 4000
    })
}

function format(number) {
    if(typeof number === "undefined" || isNaN(number)) return 0;
    return ethers.utils.commify(parseFloat(number).toFixed(2))
}

function maxOut() {
    USDCInput.value = this.getAttribute("max")
    buypower()
}

function maxWJK() {
    USDCInput.value = this.getAttribute("max")
    buypower()
}
</script>
<h1>Chad bonds (3, 3)</h1>
{#if typeof token.contracts !== "undefined"}
    Contract: <a href="https://goerli.etherscan.io/address/{token.contracts.bonds.address}" target="_blank">{token.contracts.bonds.address}</a> (source)<br><br>
{/if}
Bond prices specially designed to be fixed during the day, the price won't go down until the next keep occurs.<br>
Then the price will adjust according to the current new price. This was done in order to protect the token from market manipulators.<br>
Imagine if it was live, a whale could crimple the price with extra new cheap tokens.<br>
<br>
On top of that, don't worry you aren't left out, while you wait your tokens are staked and auto compounded, so you won't miss on those sweet earnings!<br>
Note: you will receive the staked version of the token instead of the token itself, so be sure to add the staked token.<br>
This is done in order to not miss even a nano-cent on those gains.
<div class="ht my-1 w-full"></div>
{#if !connected}
    <div style="background:#eee;padding:1rem;border:1px solid #aaa;border-radius:.5rem">
        Connect wallet first or change to a supported blockchain,<br>the website uses wallet connection to connect to the blockchain
    </div>
{:else}
    $WJK price: {format(price)}$<br>
    Bond price: {(bondPrice - (bondPrice / 5)).toFixed(4)}$ (-{(100.0 - 100.0 / (price / (bondPrice - (bondPrice / 5)))).toFixed(1)}% discount)<br>
    Vesting time: 2 day<br>
    $WJK available for purchase: {format(availPurchase)}<br>
    {#if USDC != null}
        <table class="w-full mt-1 shadow rounded border bg-white">
            <tr>
                <td class="border blue px-0_5 py-0_5 w-half bg-white rounded-l-t" style="vertical-align:top">
                    <img style="width:1rem" src="/static/images/usdc.webp" alt="USDC tokens">
                    Approve $USDC<br><br>
                    Increase the allowance for the smart contract to spend on your behalf<br><br>
                    <input type="text" bind:this="{approveUSDC}" style="width:100%" placeholder="Allowance: {USDC_allowance.gt(unlimited) ? "Unlimited" : format(ethers.utils.formatEther(USDC_allowance))}"><br>
                    <button on:click="{approve}">Approve</button>
                    <button on:click="{approveUnlimited}">Approve Unlimited</button>
                </td>
                <td class="relative border blue px-0_5 py-0_5 bg-white rounded-r-t" style="vertical-align:top">
                    {#if !USDC_allowance.gt("1")}
                        <div class="absolute l-0 t-0 w-full h-full half-transparent"></div>
                    {/if}
                    <img style="width:1rem" src="/static/images/usdc.webp" alt="USDC tokens">
                    USDC Bonds<br><br>
                    type the amount of $WJK you'd like to purchase<br>
                    <span style="font-size:13px">Maximum can be bought: {format(maxBought - 0.1)}$</span><br>
                    <span style="font-size:13px">Balance: {format(USDC_holdings)}$ (<span class="cblue hover:underline pointer" on:click="{maxOut}" max="{USDC_holdings}">MAX</span>)</span>
                    <br><br>
                    <input type="text" placeholder="$USDC amount" style="width:100%" bind:this="{USDCInput}" on:keyup="{buypower}"><br>
                    Total $WJK you get: {format(sum)} (<span class="cblue hover:underline pointer" on:click="{maxWJK}" max="{availPurchase * (bondPrice - (bondPrice / 5))}">MAX</span>)<br><br>
                    <button on:click="{bond}">Bond</button>
                </td>
            </tr>
            <tr>
                <td class="border blue px-0_5 py-0_5 bg-white rounded-l-b rounded-r-b" colspan="2">
                    Claimable:<br>
                    {format(Chads)} $CHAD can be redeemed in {timeleft.days} days, {timeleft.hours} hours, {timeleft.minutes} minutes, {timeleft.seconds} seconds
                    <br><br>
                    <button on:click="{claimAll}">Claim all</button>
                </td>
            </tr>
        </table>
        <h3>Statistics</h3>
        USDC Bonded: {format(usdcCollected)}<br>
        $WJK sold in Bonds: {format(bonded)}
    {/if}
{/if}