import { IExecuteProps } from '../types';
import { parseCustomId } from '../common/utils';

export const interactionCreate = () => ({
  name: 'interactionCreate',
  execute: async ({ interaction, commands, commandNames, buttons, buttonNames }: IExecuteProps) => {
    if (interaction.isCommand()) {
      const commandName = commandNames.find((name) => name === interaction.commandName);
      if (!commandName) return;
      const { guildId, channelId } = interaction;
      if (!guildId || !channelId) return;
      const command = commands.get(commandName);
      if (!command) return;
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(JSON.stringify(error));
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: 'There was an error while executing this command!',
            ephemeral: true,
          });
        } else {
          await interaction.editReply({
            content: 'There was an error while executing this command!',
            embeds: [],
          });
        }
      }
    } else if (interaction.isButton()) {
      const { customId } = interaction;
      const { name, options } = parseCustomId(customId) as { options: Array<string>; name: string };
      if (buttonNames.indexOf(name) === -1) return;
      const { guildId, channelId } = interaction;
      if (!guildId || !channelId) return;
      const button = buttons.get(name);
      if (!button) return;
      try {
        await button.execute(interaction, options);
      } catch (error) {
        console.error(JSON.stringify(error));
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: 'There was an error while executing this button!',
            ephemeral: true,
          });
        } else {
          await interaction.editReply({
            content: 'There was an error while executing this button!',
            embeds: [],
          });
        }
      }
    }
  },
});
