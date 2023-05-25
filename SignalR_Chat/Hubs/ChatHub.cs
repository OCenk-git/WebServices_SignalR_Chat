using Microsoft.AspNetCore.SignalR;

namespace SignalR_Chat.Models
{
    public class ChatHub : Hub
    {
        private static readonly Dictionary<string, string> chatClients = new Dictionary<string, string>();

        public void SignOn(string chatName)
        {
            try
            {
                chatClients.Add(chatName, Context.ConnectionId);

                Clients.All.SendAsync("handleSignOn", chatClients.Keys.ToArray());
            }
            catch (Exception e)
            {
                Clients.Caller.SendAsync("sendServerError", e.Message);
            }
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            KeyValuePair<string, string> user = chatClients.SingleOrDefault(kvp => kvp.Value == Context.ConnectionId);

            chatClients.Remove(user.Key);

            await Clients.Others.SendAsync("handleSignOff", user.Key);

            await base.OnDisconnectedAsync(exception);
        }

        public void BroadcastMsg(string msg)
        {
            Clients.All.SendAsync("receiveMsg", msg);
        }

        public void SendMsg(string user, string msg)
        {
            string id = chatClients[user];

            Clients.Client(id).SendAsync("receiveMsg", msg);
        }
    }
}