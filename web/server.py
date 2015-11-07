import BaseHTTPServer
import SimpleHTTPServer
import sys
from urlparse import urlparse, parse_qs
from urllib import unquote
import json
from pymongo import MongoClient
from pymongo.cursor import Cursor





client = MongoClient('localhost', 27017)
db = client['SFTaxi']
collection = db['trips']

def queryTrips( bbox ):
    orgBbox = bbox["org"]
    dstBbox = bbox["dst"]
    resCursor = collection.find ( {"firstGeo": {"$within": {"$box": orgBbox }}, 
                            "lastGeo": {"$within": {"$box": dstBbox}} }, 
                             fields= [ "coordinates", "gameDay" ] )
    res = {"gd": [], "ngd": [] }
    for ele in resCursor:
        if ele["gameDay"]:
            res["gd"].append( ele["coordinates"] )
        else:
            res["ngd"].append( ele["coordinates"] )
    return res                    
            


class Handler ( SimpleHTTPServer.SimpleHTTPRequestHandler ):
    
    def do_GET(self):
        out = urlparse( self.path )
        if out.path == '/qtrips':
            queryBox = json.loads( unquote(out.query) )
            self.send_response(200)
            self.send_header("Content-type", "text/plain")
            self.end_headers()
            # query the mongoDB for results
            val = queryTrips( queryBox )
            self.wfile.write( json.dumps(val) )
        else:
            f = self.send_head()
            if f:
                self.copyfile(f, self.wfile)
                f.close()
                

                
if __name__ == '__main__':
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    else:
        port = 8080
    server_address = ('0.0.0.0', port)
    Server = BaseHTTPServer.HTTPServer    
    
    httpd = Server( server_address, Handler )
    
    sa = httpd.socket.getsockname()
    
    print "Serving HTTP on ", sa[0], "port", sa[1]
    httpd.serve_forever()