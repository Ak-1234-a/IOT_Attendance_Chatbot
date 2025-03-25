from http.server import HTTPServer, SimpleHTTPRequestHandler

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=".", **kwargs)

if __name__ == "__main__":
    server_address = ('', 3000)
    httpd = HTTPServer(server_address, Handler)
    print("Server running on http://localhost:3000")
    httpd.serve_forever()