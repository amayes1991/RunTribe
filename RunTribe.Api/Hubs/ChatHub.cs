using Microsoft.AspNetCore.SignalR;
using RunTribe.Api.DTOs;

namespace RunTribe.Api.Hubs;

public class ChatHub : Hub
{
    public async Task JoinGroup(string groupId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, groupId);
        Console.WriteLine($"User {Context.ConnectionId} joined group {groupId}");
    }

    public async Task LeaveGroup(string groupId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupId);
        Console.WriteLine($"User {Context.ConnectionId} left group {groupId}");
    }

    public async Task SendMessage(string groupId, MessageResponse message)
    {
        await Clients.Group(groupId).SendAsync("ReceiveMessage", message);
        Console.WriteLine($"Message sent to group {groupId}: {message.Content}");
    }

    public async Task UserTyping(string groupId, string userEmail)
    {
        await Clients.Group(groupId).SendAsync("UserTyping", userEmail);
    }

    public async Task UserStoppedTyping(string groupId, string userEmail)
    {
        await Clients.Group(groupId).SendAsync("UserStoppedTyping", userEmail);
    }

    public override async Task OnConnectedAsync()
    {
        Console.WriteLine($"Client connected: {Context.ConnectionId}");
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        Console.WriteLine($"Client disconnected: {Context.ConnectionId}");
        await base.OnDisconnectedAsync(exception);
    }
}
