import { Client, GatewayIntentBits, Collection, CommandInteraction } from 'discord.js';
import * as commandHandlers from './commands';
import Command from './commands/commands';
import envs from './common/envs';
import { IDiscordCommand } from './types';
import * as eventHandlers from './events';

const { DISCORD_TOKEN } = envs;

const commandNames: Array<string> = [];
const discordCommands = new Collection<string, IDiscordCommand>();

const initializeBot = () => {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
    ],
  });
  Object.values(commandHandlers).forEach((command: Command) => {
    discordCommands.set(command.name, command.getCommand());
    commandNames.push(command.name);
  });

  const interactionCreateEventHandler = eventHandlers.interactionCreate();
  client.on(interactionCreateEventHandler.name, (interaction: CommandInteraction) =>
    interactionCreateEventHandler.execute({
      interaction,
      commands: discordCommands,
      commandNames,
    }),
  );
  client.login(DISCORD_TOKEN);
};
initializeBot();
