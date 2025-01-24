import { Telegraf, Markup } from "telegraf";
import { config } from "dotenv";

config();

if (!process.env.BOT_TOKEN) {
  throw new Error("BOT TOKEN IS NOT PROVIDED!");
}

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.on("", (ctx) => {
  return ctx.reply("<b>Coke</b> or <i>Pepsi?</i>", {
    parse_mode: "HTML",
    ...Markup.inlineKeyboard([
      Markup.button.callback("Coke", "Coke"),
      Markup.button.callback("Pepsi", "Pepsi"),
    ]),
  });
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
