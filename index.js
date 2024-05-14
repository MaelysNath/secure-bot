//Dev par @MaelysNath
//merci à lotharie, Zarmakuizz pour votre aide <3

//système d'adhésion


//déclarer les intents
const { Client, EmbedBuilder, ChannelType, Collection, GatewayIntentBits, Partials, ButtonBuilder, ButtonStyle, ActionRowBuilder  } = require( "discord.js" );
require("dotenv").config();
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildModeration,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessageTyping,
	],
	partials: [
		Partials.Message,
		Partials.Reaction,
		Partials.GuildMember,
		Partials.User,
		Partials.Channel,
		Partials.ThreadMember,
		
	]
});

//lorsque le bot est en ligne
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });

//Lorsque qu'un membre rejoint le serveur, il obtient un rôle automatiquement
  client.on('guildMemberAdd', member => {
    const roleId = '1239934182365593642'; 
    const role = member.guild.roles.cache.get(roleId);
    if (role) {
        member.roles.add(role)
            .then(() => console.log(`Rôle ajouté à ${member.user.tag}`))
            .catch(console.error);
    } else {
        console.error(`Impossible de trouver le rôle avec l'ID ${roleId}`);
    }
});


//quand une personne tape la commande "!bienvenue" un message "embed" ainsi qu'un boutton "je veux entrer"
client.on('messageCreate', async (message) => {
  if (message.content === '!bienvenue') {
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Bienvenue, cliquez pour valider')
      .setDescription('Cliquez sur le bouton ci-dessous pour confirmer votre entrée.');

    const button = new ButtonBuilder()
      .setStyle(ButtonStyle.Primary)
      .setLabel('Je veux entrer')
      .setCustomId('validateButton');
      

    const row = new ActionRowBuilder()
      .addComponents(button);

    await message.channel.send({ 
        embeds: [embed],
        components: [row] 
    
    });

  }
});

 

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'validateButton') {
    const user = interaction.user;
    const creationDate = user.createdAt.toLocaleDateString('fr-FR');

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Demande d\'adhésion')
      .setDescription(`Un utilisateur souhaite entrer dans le serveur.`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, format: 'png', size: 4096 }))
      .addFields(
        { name: 'Pseudo', value: user.tag },
        { name: 'Identifiant', value: user.id },
        { name: 'création du compte', value: creationDate },
        
      );
      
      
     
    //Boutton Accepter
    const acceptButton = new ButtonBuilder()
    .setStyle(ButtonStyle.Success)
      .setLabel('Accepter')
      .setCustomId('acceptButton');
    //boutton Refuser
    const rejectButton = new ButtonBuilder()
    .setStyle(ButtonStyle.Danger)
      .setLabel('Refuser')
      .setCustomId('rejectButton');

    const row = new ActionRowBuilder()
      .addComponents(acceptButton, rejectButton);

    const channel = client.channels.cache.get('1239933476346531923');
    if (channel.type === ChannelType.GuildText) {
      await channel.send({ 
        embeds: [embed],
        components: [row] 
      });

      await interaction.reply({ content: ' Je prends en compte ta demande d\'adhésion, attends que la modération valide ta demande.', ephemeral: true });
    } else {
      console.log('Salon introuvable.');
    }
  } else if (interaction.customId === 'acceptButton') {
    const userId = interaction.message.embeds[0].fields.find(field => field.name === 'Identifiant').value;
    const member = interaction.guild.members.cache.get(userId);
    const role = interaction.guild.roles.cache.get('1239933830178017290'); //identifiant du rôle si l'utilisateur est accepté
    if (member && role) {
      member.roles.add(role)
        .then(() => {
          // Désactive le bouton "Accepter" 
          const disabledAcceptButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setLabel('Accepter')
            .setCustomId('acceptButton')
            .setDisabled(true);
          // Désactive le bouton "Refuser"
          const disabledRejectButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setLabel('Refuser')
            .setCustomId('rejectButton')
            .setDisabled(true);

          const row = new ActionRowBuilder()
            .addComponents(disabledAcceptButton, disabledRejectButton);
          interaction.message.edit({ 
            components: [row]
           });

           interaction.reply({ content: 'L\'utilisateur a été accepté et le rôle lui a été attribué.', ephemeral: true });
        })
        .catch(error => {
          console.error('Erreur lors de l\'attribution du rôle :', error);
          interaction.reply({ content: 'Une erreur est survenue lors de l\'attribution du rôle.', ephemeral: true });
        });
    } else {
      console.error('Membre ou Rôle introuvable.');
      interaction.reply({ content: 'Le membre ou Le rôle spécifié est introuvable.', ephemeral: true });
    }

  } else if (interaction.customId === 'rejectButton') {
    const userId = interaction.message.embeds[0].fields.find(field => field.name === 'Identifiant').value;
    const member = interaction.guild.members.cache.get(userId);
    if (member) {
      member.kick('Invitation refusée')
        .then(() => {
          
           // Désactive le bouton "Accepter"
          const disabledAcceptButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setLabel('Accepter')
            .setCustomId('acceptButton')
            .setDisabled(true);
           // Désactive le bouton "Refuser"
          const disabledRejectButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setLabel('Refuser')
            .setCustomId('rejectButton')
            .setDisabled(true);
          const row = new ActionRowBuilder()
            .addComponents(disabledAcceptButton, disabledRejectButton);

          interaction.message.edit({ 
            components: [row] 
          
          });

          interaction.reply({ content: 'L\'utilisateur a été refusé et a été expulsé du serveur.', ephemeral: true });
        })
        .catch(error => {
          console.error('Erreur lors de l\'expulsion :', error);
          interaction.reply({ content: 'Une erreur est survenue lors de l\'expulsion.', ephemeral: true });
        });
    } else {
      console.error('Membre introuvable.');
      interaction.reply({ content: 'Le membre spécifié est introuvable.', ephemeral: true });
    }
  }

});
  


//connexion du bot
client.login(process.env.TOKEN);
