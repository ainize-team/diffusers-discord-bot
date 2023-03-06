require("dotenv").config();
const { REST, Routes } = require("discord.js");

const { DISCORD_TOKEN, APPLICATION_ID, GUILD_ID } = process.env;
const commandHandlers = require("../dist/commands");

const commands = Object.values(commandHandlers).map(command => command.getCommand().data.toJSON());

const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

// deploy commands!
(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(Routes.applicationGuildCommands(APPLICATION_ID, GUILD_ID), { body: commands });

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();
