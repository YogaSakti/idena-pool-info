/* eslint-disable require-unicode-regexp */
/* eslint-disable camelcase */
require('dotenv').config();
const { Telegraf } = require('telegraf');
const api = require('./api');
const moment = require('moment-timezone');
moment.locale('id');

const { botToken } = process.env;
const { poolAddress } = process.env;

const bot = new Telegraf(botToken);
bot.catch((error) => console.log('bot error', error));

bot.command('start', (ctx) => ctx.reply('hello!'));
bot.command('about', async (ctx) => {
    const poolMembers = await api.getDelegators(poolAddress);
    const { size } = await api.getPool(poolAddress)
    ctx.replyWithMarkdown(`*Imperial Pool*\n- Pool Address: _${poolAddress}_\n- Pool Size: ${size}\n- Pool Members: ${poolMembers.length}\n\nMy node:\n- Run on Digital Ocean (Singapore)\n- Auto node update (idena-manager)\n- 100% uptime, Monitored 24/7\n- Experienced node operator\n- Payment on Validation day`)
});
bot.command('members', async (ctx) => {
    console.log(`${ctx.update.message?.from?.username || ctx.update.message?.from?.first_name || ctx.update.message?.from?.last_name} > Members`);
    const poolMembers = await api.getDelegators(poolAddress);
    const content = poolMembers.map((member, idx) => `${idx + 1}. [${member.address}](https://scan.idena.io/address/${member.address})\n👤 Identitas: _${member.state}_\n⏱ Umur: ${member.age}\n`);
    const text = `Pool Members:\n${content.join(',').replace(/,/g, '')}`;
    ctx.replyWithMarkdown(text, { disable_web_page_preview: true });
});

bot.command('epoch', async (ctx) => {
    console.log(`${ctx.update.message?.from?.username || ctx.update.message?.from?.first_name || ctx.update.message?.from?.last_name} > Epoch`);
    const next = await api.getLastEpoch();
    const text = `Validasi ke _${next.epoch}_ dilaksanakan pada ${moment(next.validationTime).tz('Asia/Jakarta').format('LLL')} WIB`;
    ctx.replyWithMarkdown(text);
});

bot.command('rewards', async (ctx) => {
    console.log(`${ctx.update.message?.from?.username || ctx.update.message?.from?.first_name || ctx.update.message?.from?.last_name} > Reward`);
    const poolMembers = await api.getDelegators(poolAddress);
    const { idena: { usd } } = await api.getIdenaPrice();
    for (let i = 0; i < poolMembers.length; i++) {
        const member = poolMembers[i];
        const rewards = await api.getEpochRewards(member.address);
        const staked = rewards[0].rewards.reduce((n, { stake }) => parseFloat(n) + parseFloat(stake), 0);
        member.epoch = rewards[0].epoch
        member.total = (staked * 4).toFixed(3)
        member.staked = staked.toFixed(3)
    }
    const content = poolMembers.map((member, idx) => `${idx + 1}. [${member.address}](https://scan.idena.io/address/${member.address})\n💵 Reward: ${member.total} ($${parseFloat(member.total * usd).toFixed(2)})\n💰 Staked: ${member.staked} ($${parseFloat(member.staked * usd).toFixed(2)})\n`)
    ctx.replyWithMarkdown(`*Hasil Validasi ke ${poolMembers[0].epoch}*: \n${content.join(',').replace(/,/g, '')}`, { disable_web_page_preview: true })
});

bot.command('price', async (ctx) => {
    console.log(`${ctx.update.message?.from?.username || ctx.update.message?.from?.first_name || ctx.update.message?.from?.last_name} > Price`);
    const { idena: { usd, usd_24h_change, idr, idr_24h_change } } = await api.getIdenaPrice();
    const text = `Price of *IDENA* ([CoinGecko](https://www.coingecko.com/en/coins/idena))\n\n\`USD: $${usd}\n24H change: ${usd_24h_change.toFixed(2)}%\n\nIDR: Rp.${idr}\n24H change: ${idr_24h_change.toFixed(2)}%\``;
    ctx.replyWithMarkdown(text, { disable_web_page_preview: true });
});

const startup = async () => {
    await bot.launch()
    console.log(new Date(), 'Bot started as', bot.botInfo.username)
}

startup();