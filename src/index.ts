import { Telegraf, Markup } from "telegraf";
import { config } from "dotenv";
import axios, { AxiosError } from "axios";

config();

if (!process.env.BOT_TOKEN) {
  throw new Error("BOT TOKEN IS NOT PROVIDED!");
}

const bot = new Telegraf(process.env.BOT_TOKEN);

enum ButtonClickEvents {
  DeployDevBackend = "deploy-dev-backend",
  DeployDevFrontend = "deploy-dev-frontend",
  BuildProdBackend = "build-prod-backend",
  BuildProdFrontend = "build-prod-frontend",
}

const acceptableUserIds = [1026555793, 845519515, 835007860];
const acceptableChatsIds = [-1002479749586];

bot.command(["bot", "start"], (ctx) => {
  if (
    !acceptableUserIds.includes(ctx.message.from.id) &&
    !acceptableChatsIds.includes(ctx.message.chat.id)
  ) {
    return ctx.reply("YOU DON'T HAVE ACCESS!");
  }
  return ctx.reply(
    `
░░░░░░░░▄██▄░░░░░░▄▄░░
░░░░░░░▐███▀░░░░░▄███▌
░░▄▀░░▄█▀▀░░░░░░░░▀██░
░█░░░██░░░░░░░░░░░░░░░
█▌░░▐██░░▄██▌░░▄▄▄░░░▄
██░░▐██▄░▀█▀░░░▀██░░▐▌
██▄░▐███▄▄░░▄▄▄░▀▀░▄██
▐███▄██████▄░▀░▄█████▌
▐████████████▀▀██████░
░▐████▀██████░░█████░░
░░░▀▀▀░░█████▌░████▀░░
`,
    {
      ...Markup.inlineKeyboard([
        [
          Markup.button.callback(
            "Deploy backend DEV",
            ButtonClickEvents.DeployDevBackend
          ),
          Markup.button.callback(
            "Deploy frontend DEV",
            ButtonClickEvents.DeployDevFrontend
          ),
        ],
        [
          Markup.button.callback(
            "Build backend PROD",
            ButtonClickEvents.BuildProdBackend
          ),
          Markup.button.callback(
            "Build frontend PROD",
            ButtonClickEvents.BuildProdFrontend
          ),
        ],
      ]),
    }
  );
});

async function triggerPipeline(
  target: "backend" | "frontend",
  ref_name: "dev" | "main"
) {
  const project_id =
    target == "backend"
      ? process.env.BACKEND_PROJECT
      : process.env.FRONTEND_PROJECT;

  const token =
    target == "backend"
      ? process.env.BACKEND_PIPELINE_TOKEN
      : process.env.FRONTEND_PIPELINE_TOKEN;

  if (!project_id) {
    throw new Error("PROJECT ID IS NOT PROVIDED!");
  }

  if (!token) {
    throw new Error("PIPELINE TOKEN IS NOT PROVIDED!");
  }

  try {
    await axios.post(
      `https://gitlab.com/api/v4/projects/${project_id}/trigger/pipeline?token=${token}&ref=${ref_name}`
    );
  } catch (e: unknown) {
    if (e instanceof AxiosError) {
      console.log(e.response);
    }
  }
}

bot.action(ButtonClickEvents.DeployDevBackend, async (ctx) => {
  await triggerPipeline("backend", "dev");
  await ctx.answerCbQuery();
  return ctx.reply("Pipeline started!");
});
bot.action(ButtonClickEvents.DeployDevFrontend, async (ctx) => {
  await triggerPipeline("frontend", "dev");
  await ctx.answerCbQuery();
  return ctx.reply("Pipeline started!");
});
bot.action(ButtonClickEvents.BuildProdBackend, async (ctx) => {
  await triggerPipeline("backend", "main");
  await ctx.answerCbQuery();
  return ctx.reply("Pipeline started!");
});
bot.action(ButtonClickEvents.BuildProdFrontend, async (ctx) => {
  await triggerPipeline("frontend", "main");
  await ctx.answerCbQuery();
  return ctx.reply("Pipeline started!");
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
