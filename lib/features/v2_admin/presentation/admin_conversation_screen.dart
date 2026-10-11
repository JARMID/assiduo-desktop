import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../core/services/data_repository.dart';
import '../../../core/services/supabase_service.dart';
import '../../../core/models/conversation.dart';
import 'package:admin_portal/core/l10n/app_localizations.dart';

class AdminConversationScreen extends StatefulWidget {
  final String conversationId;

  const AdminConversationScreen({super.key, required this.conversationId});

  @override
  State<AdminConversationScreen> createState() =>
      _AdminConversationScreenState();
}

class _AdminConversationScreenState extends State<AdminConversationScreen> {
  final TextEditingController _messageController = TextEditingController();
  List<Message> _messages = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadMessages();
  }

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _loadMessages() async {
    try {
      final repo = context.read<DataRepository>();
      final messages = await repo.getMessages(widget.conversationId);
      setState(() {
        _messages = messages;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _sendMessage() async {
    if (_messageController.text.trim().isEmpty) return;

    final body = _messageController.text.trim();
    _messageController.clear();

    try {
      final repo = context.read<DataRepository>();
      final adminId = SupabaseService().currentUser?.id ?? '';

      await repo.sendMessage(
        widget.conversationId,
        adminId,
        'ADMIN',
        'Administration',
        body,
      );

      _loadMessages();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Erreur: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: Text(AppLocalizations.of(context).get('conversation')),

        elevation: 0,
      ),

      body: Column(
        children: [
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : ListView.builder(
                    padding: const EdgeInsets.all(24),
                    itemCount: _messages.length,
                    itemBuilder: (context, index) {
                      final msg = _messages[index];
                      final isAdmin =
                          msg.senderRole == 'ADMIN' ||
                          msg.senderRole == 'ADMINISTRATION';

                      return Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: Row(
                          mainAxisAlignment: isAdmin
                              ? MainAxisAlignment.end
                              : MainAxisAlignment.start,
                          children: [
                            if (!isAdmin)
                              Container(
                                margin: const EdgeInsets.only(right: 12),
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: Colors.grey.withAlpha(40),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.person, size: 20),
                              ),
                            Flexible(
                              child: Container(
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: isAdmin
                                      ? const Color(0xFF6A11CB)
                                      : (isDark
                                            ? Colors.grey[800]
                                            : Colors.grey[200]),
                                  borderRadius: BorderRadius.only(
                                    topLeft: const Radius.circular(16),
                                    topRight: const Radius.circular(16),
                                    bottomLeft: Radius.circular(
                                      isAdmin ? 16 : 0,
                                    ),
                                    bottomRight: Radius.circular(
                                      isAdmin ? 0 : 16,
                                    ),
                                  ),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      msg.senderName,
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                        color: isAdmin
                                            ? Colors.white70
                                            : (isDark
                                                  ? Colors.white70
                                                  : Colors.black54),
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      msg.body,
                                      style: TextStyle(
                                        color: isAdmin
                                            ? Colors.white
                                            : (isDark
                                                  ? Colors.white
                                                  : Colors.black87),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ),
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E2640) : Colors.white,
              border: Border(
                top: BorderSide(
                  color: isDark ? Colors.white10 : Colors.black12,
                ),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: InputDecoration(
                      hintText: 'Taper un message...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: isDark ? Colors.black26 : Colors.grey[100],
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 20,
                        vertical: 14,
                      ),
                    ),
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                const SizedBox(width: 16),
                Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Color(0xFF6A11CB), Color(0xFF2575FC)],
                    ),
                    shape: BoxShape.circle,
                  ),
                  child: IconButton(
                    icon: const Icon(Icons.send_rounded, color: Colors.white),
                    onPressed: _sendMessage,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
