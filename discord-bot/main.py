import os

import discord
from discord.ext import commands
from dotenv import load_dotenv

load_dotenv()

from bingo import Bingo

PREFIX = "$"

DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")
GUILD_ID = os.getenv("GUILD_ID", "532377514975428628")

intents = discord.Intents.all()
bot = commands.Bot(intents=intents, command_prefix=PREFIX)


@bot.event
async def on_ready():
    await bot.add_cog(Bingo(bot))
    await bot.tree.sync(guild=bot.get_guild(GUILD_ID))


@bot.command()
async def sync(ctx):
    await bot.tree.sync(guild=ctx.guild)
    await ctx.reply("Command sync successful")


@bot.command()
async def tree_clear(ctx):
    bot.tree.clear_commands(guild=ctx.guild)
    await bot.tree.sync(guild=ctx.guild)
    await ctx.reply("Command sync successful")


if __name__ == "__main__":
    bot.run(token=DISCORD_TOKEN)
