import BaseHTTPServer
import SimpleHTTPServer
import sys


class Handler ( SimpleHTTPServer.SimpleHTTPRequestHandler ):
    
    def do_GET(self):
        if self.path == '/hello':
            self.send_response(200)
            self.send_header("Content-type", "text/plain")
            self.end_headers()
            self.wfile.write("Hello")
        else:
            f = self.send_head()
            if f:
                self.copyfile(f, self.wfile)
                f.close()
                
                
if __name__ == '__main__':
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    else:
        port = 8000
    server_address = ('localhost', port)
    Server = BaseHTTPServer.HTTPServer
    
    
    httpd = Server( server_address, Handler )
    
    sa = httpd.socket.getsockname()
    
    print "Serving HTTP on ", sa[0], "port", sa[1]
    httpd.serve_forever()