import 'dart:typed_data';
import 'package:flutter/foundation.dart' as ui;
import 'package:flutter/material.dart';
import 'package:google_mlkit_barcode_scanning/google_mlkit_barcode_scanning.dart';
import 'package:camera/camera.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:typed_data/typed_buffers.dart';
import 'dart:ui' as ui show WriteBuffer, ReadBuffer;


late List<CameraDescription> _cameras;

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  _cameras = await availableCameras();
  runApp(const BarcodeScannerApp());
}

class BarcodeScannerApp extends StatelessWidget {
  const BarcodeScannerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'IoT Barcode Scanner',
      theme: ThemeData.dark().copyWith(primaryColor: Colors.blue),
      home: const ScannerScreen(),
    );
  }
}

class ScannerScreen extends StatefulWidget {
  const ScannerScreen({super.key});

  @override
  State<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends State<ScannerScreen> {
  late CameraController _cameraController;
  late BarcodeScanner _barcodeScanner;
  bool isBusy = false;
  bool isInitialized = false;
  String scannedData = "📷 Scan an employee barcode to mark attendance!";

  @override
  void initState() {
    super.initState();
    _barcodeScanner = BarcodeScanner();
    _initCamera();
  }

  void _initCamera() async {
    _cameraController = CameraController(
      _cameras[0],
      ResolutionPreset.medium,
      enableAudio: false,
    );

    await _cameraController.initialize();
    setState(() {
      isInitialized = true;
    });

    _cameraController.startImageStream((CameraImage image) async {
      if (isBusy) return;
      isBusy = true;

      try {
        // Convert to bytes
        final ui.WriteBuffer allBytes = ui.WriteBuffer();
        for (Plane plane in image.planes) {
          allBytes.putUint8List(plane.bytes);
        }
        final bytes = allBytes.done().buffer.asUint8List();

        final Size imageSize =
            Size(image.width.toDouble(), image.height.toDouble());

        final InputImageRotation rotation =
            InputImageRotation.rotation0deg; // adjust as per device

        final InputImageFormat format = InputImageFormat.nv21;

        final inputImage = InputImage.fromBytes(
          bytes: bytes,
          metadata: InputImageMetadata(
            size: imageSize,
            rotation: rotation,
            format: format,
            bytesPerRow: image.planes[0].bytesPerRow,
          ),
        );

        final barcodes = await _barcodeScanner.processImage(inputImage);
        if (barcodes.isNotEmpty) {
          final barcode = barcodes.first;
          if (barcode.rawValue != null) {
            _cameraController.stopImageStream();
            await _markAttendance(barcode.rawValue!);
          }
        }
      } catch (e) {
        print("❌ Barcode error: $e");
      }
      isBusy = false;
    });
  }

  Future<void> _markAttendance(String employeeId) async {
    setState(() {
      scannedData = "⏳ Marking attendance...";
    });

    final url = Uri.parse('http://192.168.29.119:5000/attendance');
    final response = await http.post(
      url,
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "employeeId": employeeId,
        "name": "John Doe",
        "department": "IT"
      }),
    );

    if (response.statusCode == 200) {
      setState(() {
        scannedData = "✅ Attendance marked for ID: $employeeId";
      });
    } else {
      setState(() {
        scannedData = "❌ Failed to mark attendance. Try again.";
      });
    }
  }

  @override
  void dispose() {
    _cameraController.dispose();
    _barcodeScanner.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.blue[900],
      appBar: AppBar(
        title: const Text('Smart IoT Attendance'),
        centerTitle: true,
        backgroundColor: Colors.blue[800],
      ),
      body: Column(
        children: [
          if (isInitialized)
            AspectRatio(
              aspectRatio: _cameraController.value.aspectRatio,
              child: CameraPreview(_cameraController),
            ),
          const SizedBox(height: 20),
          Text(
            scannedData,
            style: const TextStyle(color: Colors.white, fontSize: 16),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 20),
          IconButton(
            icon: const Icon(Icons.refresh, size: 30, color: Colors.white),
            onPressed: () {
              setState(() {
                scannedData =
                    "📷 Scan an employee barcode to mark attendance!";
              });
              _initCamera(); // Restart camera stream
            },
          ),
        ],
      ),
    );
  }
}
