/* eslint-disable max-params */
/* eslint-disable no-prototype-builtins */
const fetch = require('node-fetch-retry');

const baseIdena = 'https://api.idena.org/'

const get = (base, endpoint, authorization) => fetch(base + endpoint, {
    method: 'GET',
    retry: 5,
    pause: 30000,
    headers: {
        accept: 'application/json, text/plain, */*',
        authorization,
        'accept-encoding': 'gzip',
        'user-agent': 'okhttp/3.12.1',
        Referer: 'https://scan.idena.io/'
    }
})
    .then((response) => response.json())
    .then((response) => response.hasOwnProperty('result') ? response.result : response)
    .catch((err) => err)



const post = (base, endpoint, authorization, body) => fetch(base + endpoint, {
    method: 'POST',
    retry: 5,
    pause: 30000,
    headers: {
        accept: 'application/json, text/plain, */*',
        authorization,
        'content-type': 'application/json;charset=utf-8',
        'accept-encoding': 'gzip',
        'user-agent': 'okhttp/3.12.1',
        Referer: 'https://scan.idena.io/'
    },
    body: JSON.stringify(body)
})
    .then((response) => response.json())
    .then((response) => response.hasOwnProperty('result') ? response.result : response)
    .catch((err) => err)

const getIdentity = (address) => get(baseIdena, `api/identity/${address}`) 
const getDelegators = (address) => get(baseIdena, `api/pool/${address}/delegators?limit=30`) 
const getEpochRewards = (address) => get(baseIdena, `api/identity/${address}/epochrewards?limit=30`)
const getPenalties = (address) => get(baseIdena, `api/identity/${address}/penalties?limit=30`)
const getBalanceChanges = (address) => get(baseIdena, `api/identity/${address}/balance/changes?limit=30`)
const getTxs = (address) => get(baseIdena, `api/identity/${address}/txs?limit=30`)
const getEpochIdentity = (epoch, address) => get(baseIdena, `api/epoch/${epoch}/identity/${address}`)
const getEpoch = (epoch) => get(baseIdena, `api/epoch/${epoch}`)
const getLastEpoch = () => get(baseIdena, 'api/epoch/last') 
const getOnlineMinners = () => get(baseIdena, 'api/onlineminers/count') 
const getOnlineIdentities = () => get(baseIdena, 'api/onlineidentities/count') 
const getIdenaPrice = () => get('https://api.coingecko.com/', 'api/v3/simple/price?ids=idena&vs_currencies=usd%2Cidr&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true') 


module.exports = {
    get,
    post,
    getIdentity,
    getDelegators,
    getEpochRewards,
    getPenalties,
    getBalanceChanges,
    getTxs,
    getEpochIdentity,
    getEpoch,
    getLastEpoch,
    getOnlineMinners,
    getOnlineIdentities,
    getIdenaPrice
}