import { IExecuteProps } from '../types';

export const interactionCreate = () => ({
  name: 'interactionCreate',
  execute: async ({ interaction, commands, commandNames }: IExecuteProps) => {
    if (!interaction.isCommand()) return;
    const commandName = commandNames.find((name) => name === interaction.commandName);
    if (!commandName) return;
    const { guildId, channelId } = interaction;
    if (!guildId || !channelId) return;
    const command = commands.get(commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (error) {
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    }
  },
});
