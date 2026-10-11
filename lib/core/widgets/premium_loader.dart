import 'package:flutter/material.dart';

class PremiumLoader extends StatelessWidget {
  final Color color;
  final double size;

  const PremiumLoader({
    super.key,
    this.color = Colors.blue,
    this.size = 40.0,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: CircularProgressIndicator(
        valueColor: AlwaysStoppedAnimation<Color>(color),
      ),
    );
  }
}