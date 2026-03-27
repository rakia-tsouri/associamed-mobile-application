import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';

import 'providers/app_provider.dart';
import 'screens/login_screen.dart';
import 'screens/room_list_screen.dart';

void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => AppProvider(),
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Suivi des Salles',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF2196F3),
          primary: const Color(0xFF1976D2),
          secondary: const Color(0xFF00BCD4),
        ),
        useMaterial3: true,
        textTheme: GoogleFonts.outfitTextTheme(),
      ),
      home: const _AppSplashHandler(),
    );
  }
}

class _AppSplashHandler extends StatefulWidget {
  const _AppSplashHandler();

  @override
  State<_AppSplashHandler> createState() => _AppSplashHandlerState();
}

class _AppSplashHandlerState extends State<_AppSplashHandler> {
  bool _showSplash = true;
  bool _isAssetReady = false;

  @override
  void initState() {
    super.initState();
    _initializeAssets();
  }

  Future<void> _initializeAssets() async {
    // Wait for a few seconds to ensure the SVG has time to download in the background
    // before the splash screen fades out.
    await Future.delayed(const Duration(seconds: 4));

    if (mounted) {
      setState(() {
        _isAssetReady = true;
        _showSplash = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_showSplash || !_isAssetReady) {
      return Scaffold(
        backgroundColor: Colors.white,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Image.asset(
                'assets/images/associamed.PNG',
                height: 150,
              ),
              const SizedBox(height: 32),
              const CircularProgressIndicator(color: Color(0xFF1A237E)),
              const SizedBox(height: 16),
              const Text(
                'Associa-Med',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xFF1A237E)),
              ),
            ],
          ),
        ),
      );
    }

    return Consumer<AppProvider>(
      builder: (context, provider, _) {
        return provider.user == null ? const LoginScreen() : const RoomListScreen();
      },
    );
  }
}
