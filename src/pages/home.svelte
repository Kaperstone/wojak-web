<script>
let op, amount, days, profit

function update() {
    let end = parseFloat(amount.value) * Math.pow(1.0025, parseInt(days.value));
    op.innerHTML = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'USD' }).format(end);
    profit.innerHTML = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'USD' }).format(end - parseInt(amount.value)); 
}
</script>
<h1>Wojak token</h1>

A new breed of multiple tokens in a pursuit to create a new sustainable token thats supports and relies on 
exiting DeFi platforms and offering for the first time, truly fixed staking APY.<br>
The token was written from zero with no borrowed code from anywhere, thus the platform is in alpha.<br>
Don't invest more than you can afford to lose.<br>
<br>
Wojak token introduces truly new concepts (probably will be copied like a dozen times to other platforms)<br>
<br>
The token stands on 3 main pilars:
<table class="w-full mt-1 border-spacing-0_5 border-separate">
    <tr>
        <td class="w-third p-1 rounded border align-top">
            <h3 class="center underline">Supported by the treasury<br>(or PCV)</h3>
            <div class="justify">
                Not backed by the treasury, but supported by the treasury.<br>
                unlike other platforms, our treasury doesn't sit and eats grass and it won't back the token if it falls below 
                a certain threshold, the treasury is put into work on different protocols to create
                more tokens which are then sold for WJK, the bought WJK are either sent to `bonds` or
                burnt.<br>
                In other words, creates infinite deflation/price raise.
            </div>
        </td>
        <td class="w-third p-1 rounded border align-top">
            <h3 class="center underline">Fixed Staking</h3>
            <div class="center">(Exactly 0.25% per day,<br>or 148.771% annually)</div>

            <div class="justify mt-1">
                Because this token is not a modification of a popular or existing and was coded 
                from the ground up, it was written to mint 0.25% per epoch (24h), for each staker,
                individually<br>
                In other words, inflates according to the number of tokens staked.<br>
                Replacing predictable inflation with predictable maximum inflation.<br>
                <br>
                So the more is staked, the more inflation there is. Simple.
            </div>
        </td>
        <td class="w-third p-1 rounded border align-top">
            <h3 class="center underline">Soyfarms</h3>

            <div class="justify">
                Finally, a new kind of farm.<br>
                Most farms nowadays take tax on deposit, tax on withdraw, take your revenue to create
                deflation for the token and print new tokens to reward the farms.<br>
                Our farm performs differently and outperforms other farms previously seen<br>
                Your tokens are invested in the correlated farms to generate revenue, the revenue is 
                used to buy on your behalf WJK from the market, which is then put into a different staking
                contract namely `Zoomer`, which offers x2 the staking reward. 0.50% per day.<br>
                <br>
                Because of our high staking rewards we are able to generate greater interest than the native
                farm. (~52.356% to be precise, if price does not change.)
            </div>
        </td>
    </tr>
</table>
<br>
<a href="https://kaperstone.gitbook.io/wojak-1/">
    The platform is well documented, for more words of wisdom, refer to our gitbook documentation
</a>

<h4>### Locker</h4>

Get an extra revenue by locking your staked tokens and share 5% from all SoyFarm profits.

<h4>### Staking</h4>

Here is a little calculator for you (come on, dare to edit)<br><br>
<div style="border:1px dotted #bbb;padding:5px;text-align:center">
    <div style="border:1px solid #bbb;padding:1rem">
        Return for <input bind:this="{amount}" on:keyup="{update}" type="text" value="1000" style="outline:0;width:48px;border:0;border-bottom:1px dashed black;padding:5px 0;text-align:right">$ after <input type="text" style="outline:0;width:32px;border:0;border-bottom:1px dashed black;padding:5px 0;text-align:right" value="30" bind:this="{days}" on:keyup="{update}"> days = <span bind:this="{op}">$1,077.78</span><br>
        That's a profit of <span bind:this="{profit}" style="color:green">$77.78</span>
        <br><br>
        <div style="text-align:center">
            The formula:<br>
            <span style="font-size:13px">Amount</span> x (1.0025<sup>days</sup>)
        </div>
    </div>
</div>