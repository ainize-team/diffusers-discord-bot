import { Client, GatewayIntentBits, Collection, Interaction } from 'discord.js';
import * as commandHandlers from './commands';
import * as buttonHandlers from './buttons';
import Command from './commands/commands';
import envs from './common/envs';
import { IDiscordButton, IDiscordCommand } from './types';
import * as eventHandlers from './events';
import Button from './buttons/buttons';

const { DISCORD_TOKEN } = envs;

const commandNames: Array<string> = [];
const buttonNames: Array<string> = [];
const discordCommands = new Collection<string, IDiscordCommand>();
const discordButtons = new Collection<string, IDiscordButton>();

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
  Object.values(buttonHandlers).forEach((button: Button) => {
    buttonNames.push(button.name);
    discordButtons.set(button.name, button.getButton());
  });

  const interactionCreateEventHandler = eventHandlers.interactionCreate();
  client.on(interactionCreateEventHandler.name, (interaction: Interaction) =>
    interactionCreateEventHandler.execute({
      interaction,
      commands: discordCommands,
      commandNames,
      buttons: discordButtons,
      buttonNames,
    }),
  );
  client.login(DISCORD_TOKEN);
};
initializeBot();
