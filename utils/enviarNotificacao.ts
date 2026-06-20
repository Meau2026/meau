

export async function enviarNotificacaoPush(expoPushToken: string, title: string, body: string, data = {}) {
  const mensagem = {
    to: expoPushToken,
    sound: 'default',
    title: title,
    body: body,
    data: data, 
  };

  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mensagem),
    });
    console.log("Notificação enviada com sucesso!");
  } catch (error) {
    console.error("Erro ao enviar a notificação:", error);
  }
}
