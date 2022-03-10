<script>
export let provider
export let signer
export let token
export let account
export let connected

let op, amount, days, profit

function update() {
    let end = parseInt(amount.value) * Math.pow(1.005, parseInt(days.value));
    op.innerHTML = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'USD' }).format(end);
    profit.innerHTML = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'USD' }).format(end - parseInt(amount.value)); 
}
</script>
<h1>Wojak token</h1>
welcome friends<br>
<br>
this is a new token, first of its kind, its gonna fly to mars.<br>
safer than safemoon.<br>
Not a memecoin, promise.<br>
<br>
Come join revoluzion and take a look around, its free.<br>
<span style="font-size:11px">Probably going to be copied everywhere once this token launches.</span>
<br>
<br>
<h3>## About</h3>
<br>
Wojak ($WJK) token is an experimental wealth building token written from scratch, the token is inspired by many different tokens and borrows the uniqueness of each to
create a token which distributes a <b>fixed</b> high interest and a unique system that helps the token maintain its price.
<br>
This is the first token to create treasury that will - for indefinite - back the token and create a constant buyback pressure.<br>
The treasury will be filled primarily from `bond` buys and vested $BUSD will be put into work on Qubit to instantly start generate revenue,
the revenue then is used to create buyback of the token & decrease the amount of tokens in the market. Thus, the treasury is an important feature of the token.<br>
But, we aren't done yet with the buyback pressure, in order to increase the buyback pressure and create a safe investment plan for those who prefer not to trust the 
token and instead hold tokens they are already invested in, they can use the newly engineered `Soy farms` which is our unique approach to farming<br>
Investors who deposit $BUSD maintain their ownership over their $BUSD and withdraw at any time without lose, deposited tokens will put to work to generate revenue - the
revenue of the tokens will used to buy $WJK from the market and put into `Staking` in order to increase revenue for our investors.<br>
As a result, we are able to offer a <b>much</b> higher return on investment. (for example 30% return on $BUSD deposits)<br>
In the future we will diversify Soy farm to enable different strategies, add more game changing features and hopefully, with the help of Multichain - expend to other blockchains as well.
<br><br>
The token will feature simple tax:
<table style="border:1px solid #ddd">
    <tr>
        <td></td>
        <td style="text-align:center">Buy</td>
        <td style="text-align:center">Sell</td>
        <td style="text-align:center">Transfer</td>
    </tr>
    <tr>
        <td style="text-align:right">Slippage:</td>
        <td style="border:1px solid #ddd;text-align:center;width:56px">3%</td>
        <td style="border:1px solid #ddd;text-align:center;width:56px">0.5%</td>
        <td style="border:1px solid #ddd;text-align:center;width:56px">3%</td>
    </tr>
    <tr>
        <td style="text-align:right">Treasury & Liquidity:</td>
        <td style="border:1px solid #ddd;text-align:center;width:56px">1%</td>
        <td style="border:1px solid #ddd;text-align:center;width:56px">0%</td>
        <td style="border:1px solid #ddd;text-align:center;width:56px">1%</td>
    </tr>
    <tr>
        <td style="text-align:right">Burn:</td>
        <td style="border:1px solid #ddd;text-align:center;width:56px">2%</td>
        <td style="border:1px solid #ddd;text-align:center;width:56px">0%</td>
        <td style="border:1px solid #ddd;text-align:center;width:56px">2%</td>
    </tr>
</table>
<br>

<!-- //////////// -->

<h4>### SoyFarms</h4>
By depositing BUSD into the farm, the tokens will be put into Qubit to create interest, 
the interest will be used to automatically buyback $WJK from the market, which will create a buy
pressure, $WJK tokens will automatically be staked to give investors an additional fixed interest of 0.5% per day.<br>
<br>
In order to create better soy milk from our soy farms, we need to put some rules for farming.<br>
Farm rules:<br>
<ul>
    <li>Commitment to 7 day lockup.</li>
    <li>First epoch of interest won't be counted towards the new investor</li>
</ul>
<br>
This is done to avoid big players entering the game right before the buyback epoch and stealing everyone's hard work.<br>
We obligate fairly each of the investors to play the full round in order to participate in the farm.<br>
<br>
Psst. its loseless farming.

<!-- //////////// -->

<h4>### Treasury</h4>
The treasury is responsible to raise the price while still being immovable. The thought: why
maintain a treasury if it only sits and eats grass? while it can be put into investment strategies
and create a buy pressure? It has no further plans to utilize the tokens bought, therefore the tokens 
bought are then burnt.<br>
A move, that will decrease the circulating supply of the token and if the token increases too much in
supply, it will burn even more tokens.<br>
The bigger the treasury, the bigger the buy pressure.

<!-- //////////// -->

<h4>### Staking</h4>
Fixed staking, 0.5% per day, that's all.<br>
Here is a little calculator for you (come on, dare to edit)<br><br>
<div style="border:1px dotted #bbb;padding:5px;text-align:center">
    <div style="border:1px solid #bbb;padding:1rem">
        Return for <input bind:this="{amount}" on:keyup="{update}" type="text" value="1000" style="outline:0;width:48px;border:0;border-bottom:1px dashed black;padding:5px 0;text-align:right">$ after <input type="text" style="outline:0;width:32px;border:0;border-bottom:1px dashed black;padding:5px 0;text-align:right" value="30" bind:this="{days}" on:keyup="{update}"> days = <span bind:this="{op}">$1,161.40</span><br>
        That's a profit of <span bind:this="{profit}" style="color:green">$161.40</span>
        <br><br>
        <div style="text-align:center">
            The formula:<br>
            <span style="font-size:13px">Amount</span> x (1.005<sup>days</sup>)
        </div>
    </div>
</div>

<!-- //////////// -->

<h4>### Bonds</h4>
Bonds help us increase the treasury, you can also donate, but we prefer this method.<br>
In exchange, we mint new tokens and sell for 20% off the price.<br>
<br>

<!-- //////////// -->

<h4>### Blockchains</h4>

Currently we chose to start off with Binance Smart Chain because of its better reach to new investors.<br>
Our unique system enables us to support the same functionality on different blockchains and thus we will attempt to support as many blockchains as we possibly reach.

<!-- //////////// -->

<h4>### Partnerships</h4>
None, lol.<br>
We don't work with any VC, marketing or exchange.<br>
Don't even contact us.<br>
<br>
<br>
No meaningless "we burnt 1 bizzilion tokens at launch" and won't.<br>
Because there is no meaning, if it was never in the market, it was never really part of the circulating supply.<br>
Simple as that.<br>
We won't list fake partnerships with every platform we use.<br>
VC's ruin our economy by selling all of their tokens when the token succeed, making the token <a href="https://www.youtube.com/watch?v=mTRmAhu08pA" target="_blank">take an arrow in the </a><a href="https://www.youtube.com/watch?v=mSDfxde8fSg" target="_blank">knee</a><br>
Exchanges require huge sums of money to be listed or huge amount of tokens, which is meh.<br>
Marketing are all fake, useless and waste of money.<br>
Organic is the best way, a good project will always succeed.<br>
<br>

<!-- //////////// -->

<h4>### Roadmap</h4>
<ul>
    <li>Advanced farms</li>
    <li>Weighted farms</li>
    <li></li>
</ul>

<!-- //////////// -->

<h4>### Comparison</h4>
Other tokens are fake bro


<!-- //////////// -->

<h4>### Burns</h4>
True burns

<!-- //////////// -->

<h4>### Website</h4>
Why the fuck is the website so ugly?<br>
Good question, I am lazy, I like minimal and websites should be easy to understand and enough, detailed and simple to understand information should be written that every new person even to crypto, should understand.<br>
<br>
<br>
<br>
That's all, kthxbye.