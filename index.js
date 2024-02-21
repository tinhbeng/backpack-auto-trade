"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const backpack_client_1 = require("./backpack_client");

/// EDIT HERE ///
// const API_KEY = "b0KPCPT0i0z63NB2zB137ESZDA7GPKfNq73y5hj8nGc=";
// const API_SECRET = "ykBr9pQNLiM8018c6C80vkPmuO+uGuxBzB4BsjljzSE=";
const API_KEY = "woaUjfiYD1nQW+ZAPtgaeCF5jovMX2eD80XKAZRfQcM=";
const API_SECRET = "IRUDZqWQk/k8xiZPx6bH3fMJJdwK7X3M7g8gzEraMbc=";
/////////////

function delay(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}


function getCurrentTimeTrade() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    var strHour = date.getHours();
    var strMinute = date.getMinutes();
    var strSecond = date.getSeconds();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    if (strHour >= 0 && strHour <= 9) {
        strHour = "0" + strHour;
    }
    if (strMinute >= 0 && strMinute <= 9) {
        strMinute = "0" + strMinute;
    }
    if (strSecond >= 0 && strSecond <= 9) {
        strSecond = "0" + strSecond;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
        + " " + strHour + seperator2 + strMinute
        + seperator2 + strSecond;
    return currentdate;
}

let successbuy = 0;
let sellbuy = 0;

const getRandomIntInclusive = (min, max) => {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}

const init = async (client) => {
    const numberRandom = getRandomIntInclusive(5000, 7000);
    try {
        console.log("\n============================")
        console.log(`Total Buy: ${successbuy} | Total Sell: ${sellbuy}`);
        console.log("============================\n")
        
        console.log(getCurrentTimeTrade(), `Waiting ${numberRandom/1000} seconds...`);
        await delay(numberRandom);

        let userbalance = await client.Balance();
        if (userbalance.USDC.available > 5) {
            await buy(client);
        } else {
            await sell(client);
            return;
        }
    } catch (e) {
        console.log(getCurrentTimeTrade(), `Try again... (${e.message})`);
        console.log("=======================")

        await delay(numberRandom);
        init(client);

    }
}

const buy = async (client) => {
    let getListOrder = await client.GetOpenOrders({ symbol: "BONK_USDC" });
    console.log("getListOrder.length", getListOrder.length)
    if (getListOrder.length > 0) {
        let CancelOpenOrders = await client.CancelOpenOrders({ symbol: "BONK_USDC" });
        console.log(getCurrentTimeTrade(), "All pending orders canceled");
    }
    let userbalance = await client.Balance();
    console.log(getCurrentTimeTrade(), `My Account Infos: ${userbalance.BONK.available} $BONK | ${userbalance.USDC.available} $USDC`, );
    let { lastPrice } = await client.Ticker({ symbol: "BONK_USDC" });
    console.log(getCurrentTimeTrade(), "Price of sol_usdc:", lastPrice);
    let quantitys = ((userbalance.USDC.available - 2) / lastPrice).toFixed(0).toString();
    console.log(getCurrentTimeTrade(), `Buy ${(userbalance.USDC.available - 2).toFixed(2).toString()} $USDC to ${quantitys} $BONK`);
    let orderResultBid = await client.ExecuteOrder({
        orderType: "Limit",
        price: (lastPrice + 0.00000003).toString(),
        quantity: quantitys,
        side: "Bid",
        symbol: "BONK_USDC",
        timeInForce: "IOC"
    })
    if (orderResultBid?.status == "Filled" && orderResultBid?.side == "Bid") {
        successbuy += 1;
        console.log(getCurrentTimeTrade(), "Bought successfully:", `Order number: ${orderResultBid.id}`);
        init(client);
    } else {
        if (orderResultBid?.status == 'Expired'){
            throw new Error("Buy Order Expired");
        } else{
            throw new Error(orderResultBid?.status);
        }
    }
}


const sell = async (client) => {
    let GetOpenOrders = await client.GetOpenOrders({ symbol: "BONK_USDC" });
    if (GetOpenOrders.length > 0) {
        let CancelOpenOrders = await client.CancelOpenOrders({ symbol: "BONK_USDC" });
        console.log(getCurrentTimeTrade(), "All pending orders canceled");
    }

    let userbalance2 = await client.Balance();
    console.log(getCurrentTimeTrade(), `My Account Infos: ${userbalance2.BONK.available} $BONK | ${userbalance2.USDC.available} $USDC`, );
    
    let { lastPrice } = await client.Ticker({ symbol: "BONK_USDC" });
    console.log(getCurrentTimeTrade(), "Price sol_usdc:", lastPrice);
    let quantitys = (userbalance2.BONK.available - 10).toFixed(0).toString();
    console.log(getCurrentTimeTrade(), `Sell ${quantitys} $BONK to ${(lastPrice * quantitys).toFixed(2)} $USDC`);
    let orderResultAsk = await client.ExecuteOrder({
        orderType: "Limit",
        price: (lastPrice - 0.00000003).toString(),
        quantity: quantitys,
        side: "Ask",
        symbol: "BONK_USDC",
        timeInForce: "IOC"
    })
    if (orderResultAsk?.status == "Filled" && orderResultAsk?.side == "Ask") {
        sellbuy += 1;
        console.log(getCurrentTimeTrade(), "Sold successfully:", `Order number:${orderResultAsk.id}`);
        init(client);
    } else {
        if (orderResultAsk?.status == 'Expired'){
            throw new Error("Sell Order Expired");
        } else{
            throw new Error(orderResultAsk?.status);
        }
    }
}

(async () => {
    const apisecret = API_SECRET;
    const apikey = API_KEY;
    const client = new backpack_client_1.BackpackClient(apisecret, apikey);
    init(client);
})()
