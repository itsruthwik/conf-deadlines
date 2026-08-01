#!/usr/bin/env python3
# coding: utf-8

# Sort and Clean conference data.
# It writes to `sorted_data.yml` and `cleaned_data.yml`, copy those to the conference.yml after screening.

import yaml
import datetime
import sys
from shutil import copyfile
from builtins import input
import pytz

import pdb

try:
    # for python newer than 2.7
    from collections import OrderedDict
except ImportError:
    # use backport from pypi
    from ordereddict import OrderedDict

try:
    from yaml import CLoader as Loader, CDumper as Dumper
except ImportError:
    from yaml import Loader, Dumper
from yaml.representer import SafeRepresenter
_mapping_tag = yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG


def dict_representer(dumper, data):
    return dumper.represent_dict(data.iteritems())


def dict_constructor(loader, node):
    return OrderedDict(loader.construct_pairs(node))


Dumper.add_representer(OrderedDict, dict_representer)
Loader.add_constructor(_mapping_tag, dict_constructor)

Dumper.add_representer(str, SafeRepresenter.represent_str)


def ordered_dump(data, stream=None, Dumper=yaml.Dumper, **kwds):
    class OrderedDumper(Dumper):
        pass

    def _dict_representer(dumper, data):
        return dumper.represent_mapping(
            yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG, data.items())

    OrderedDumper.add_representer(OrderedDict, _dict_representer)
    return yaml.dump(data, stream, OrderedDumper, **kwds)


dateformat = '%Y-%m-%d %H:%M:%S'
tba_words = ["tba", "tbd"]
fallback_tz = 'UTC-12'


def deadline_to_utc(conf):
    """Parse a conference deadline as an aware UTC datetime.

    Defaults unknown/TBA timezones to UTC-12 (end-of-day AoE convention),
    matching the behavior of the site's client-side JavaScript.
    """
    tz = conf.get('timezone', fallback_tz)
    if tz in ('', 'TBA', 'TBD', None):
        tz = fallback_tz
    zone = tz.replace('UTC+', 'Etc/GMT-').replace('UTC-', 'Etc/GMT+')
    try:
        tzinfo = pytz.timezone(zone)
    except pytz.UnknownTimeZoneError:
        tzinfo = pytz.timezone('Etc/GMT+12')
    naive = datetime.datetime.strptime(conf['deadline'], dateformat)
    return pytz.utc.normalize(naive.replace(tzinfo=tzinfo))


# Helper function for yes no questions
def query_yes_no(question, default="no"):
    """Ask a yes/no question via input() and return their answer.

    "question" is a string that is presented to the user.
    "default" is the presumed answer if the user just hits <Enter>.
        It must be "yes" (the default), "no" or None (meaning
        an answer is required of the user).

    The "answer" return value is True for "yes" or False for "no".
    """
    valid = {"yes": True, "y": True, "ye": True, "no": False, "n": False}
    if default is None:
        prompt = " [y/n] "
    elif default == "yes":
        prompt = " [Y/n] "
    elif default == "no":
        prompt = " [y/N] "
    else:
        raise ValueError("invalid default answer: '%s'" % default)

    while True:
        sys.stdout.write(question + prompt)
        choice = input().lower()
        if default is not None and choice == '':
            return valid[default]
        elif choice in valid:
            return valid[choice]
        else:
            sys.stdout.write("Please respond with 'yes' or 'no' "
                             "(or 'y' or 'n').\n")


# Sort:

with open("../_data/conferences.yml", 'r') as stream:
    try:
        data = yaml.load(stream, Loader=Loader)
        print("Initial Sorting:")
        for q in data:
            print(q["deadline"], " - ", q["title"])
        print("\n\n")
        conf = [x for x in data if x['deadline'].lower() not in tba_words]
        tba = [x for x in data if x['deadline'].lower() in tba_words]

        # just sort:
        conf.sort(key=deadline_to_utc)
        print("Date Sorting:")
        for q in conf + tba:
            print(q["deadline"], " - ", q["title"])
        print("\n\n")

        with open('sorted_data.yml', 'w') as outfile:
            for line in ordered_dump(
                    conf + tba,
                    Dumper=yaml.SafeDumper,
                    default_flow_style=False,
                    explicit_start=True).splitlines():
                outfile.write(line.replace('- title:', '\n- title:'))
                outfile.write('\n')
    except yaml.YAMLError as exc:
        print(exc)
