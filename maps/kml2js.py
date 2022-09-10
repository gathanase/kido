import xml.etree.ElementTree as ET
import argparse
import json

parser = argparse.ArgumentParser(description='Convert kml files to js')
parser.add_argument('file', nargs='+', help='kml files')

args = parser.parse_args()
ns = "{http://www.opengis.net/kml/2.2}"

def parseKml(filename):
    res = {'name': filename, 'targets': {}, 'perimeter': None}
    tree = ET.parse(filename)
    root = tree.getroot()
    for mark in root.iter(f'{ns}Placemark'):
        desc = mark.findtext(f'{ns}description')
        pos = mark.findtext(f'{ns}Point/{ns}coordinates')
        polygon = mark.findtext(f'{ns}Polygon/{ns}outerBoundaryIs/{ns}LinearRing/{ns}coordinates')
        if pos:
            code, group = desc.split('-')
            lon, lat = pos.split(',')
            res['targets'][code] = {'code': code, 'group': group, 'lat': lat, 'lon': lon}
        if polygon:
            perimeter = []
            for p in polygon.split(' '):
                lon, lat = p.split(',')
                perimeter.append({'lat': lat, 'lon': lon})
            res['perimeter'] = perimeter
    return res


geos = []
for filename in args.file:
    geos.append(parseKml(filename))
with open(f'geos.js', 'w') as f:
  f.write("const geos = ")
  json.dump(geos, f)
