import xml.etree.ElementTree as ET
import argparse
import json


parser = argparse.ArgumentParser(description='Convert kml files to js')
parser.add_argument('file', nargs='+', help='kml files')

args = parser.parse_args()
ns = "{http://www.opengis.net/kml/2.2}"

def parseKml(filename):
    if filename == 'maps/26_pignedore.kml':
        name = "Lac de Pignedore"
        desc = "Circuit très simple autour du lac de pignedore"
    if filename == 'maps/26_suze_la_rousse.kml':
        name = "Parc du chateau de Suze la rousse"
        desc = "Circuit forestier dans le parc du chateau"
    res = {'name': name, 'description': desc, 'control_points': [], 'perimeter': None}
    tree = ET.parse(filename)
    root = tree.getroot()
    for mark in root.iter(f'{ns}Placemark'):
        desc = mark.findtext(f'{ns}description')
        pos = mark.findtext(f'{ns}Point/{ns}coordinates')
        polygon = mark.findtext(f'{ns}Polygon/{ns}outerBoundaryIs/{ns}LinearRing/{ns}coordinates')
        if pos:
            code, group = desc.split('-')
            lon, lat = pos.split(',')
            res['control_points'].append({'code': code, 'group': group, 'lat': lat, 'lon': lon})
        if polygon:
            perimeter = []
            for p in polygon.split(' '):
                lon, lat = p.split(',')
                perimeter.append({'lat': lat, 'lon': lon})
            res['perimeter'] = perimeter
    return res


circuits = []
for filename in args.file:
    circuits.append(parseKml(filename))
with open(f'circuits.js', 'w') as f:
  f.write("const circuits = ")
  json.dump(circuits, f)
