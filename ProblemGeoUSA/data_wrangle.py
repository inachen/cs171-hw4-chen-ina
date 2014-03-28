import json
from pprint import pprint
import time
import io

# from http://www.codigomanso.com/en/2011/05/trucomanso-transformar-el-tiempo-en-formato-24h-a-formato-12h-python/
def ampmformat (hhmmss):
  """
    This method converts time in 24h format to 12h format
    Example:   "00:32" is "12:32 AM"
               "13:33" is "01:33 PM"
  """
  ampm = hhmmss.split (":")
  if (len(ampm) == 0) or (len(ampm) > 3):
    return hhmmss

  # is AM? from [00:00, 12:00[
  hour = int(ampm[0]) % 24
  isam = (hour >= 0) and (hour < 12)

  # 00:32 should be 12:32 AM not 00:32
  if isam:
    ampm[0] = ('12' if (hour == 0) else "%02d" % (hour))
  else:
    ampm[0] = ('12' if (hour == 12) else "%02d" % (hour-12))

  return ':'.join (ampm) + (' AM' if isam else ' PM')

json_data=open('allData2003_2004.json')

data = json.load(json_data)
json_data.close()

# k ='690150'
# print data['690150']

output = {'1': {},
    '2': {},
    '3': {},
    '4': {},
    '5': {},
    '6': {},
    '7': {}, 
    '8': {},
    '9': {},
    '10': {},
    '11': {}, 
    '12': {}
    }

for k in data.keys():
    for d in data[k]:
        date = time.strptime(d['date'], "%b %d, %Y %I:%M:%S %p")
        month = str(date.tm_mon)
        if k in output[month]:
            t = ampmformat('%02d:%02d:%02d' % (date.tm_hour, date.tm_min, date.tm_sec))
            output[month][k]['sum'] += d['value']
            output[month][k]['hourly'][t] += d['value']
        else:
            output[month][k] =  { "sum": 0,
                "hourly": {
                "01:00:00 AM": 0,
                "02:00:00 AM": 0,
                "03:00:00 AM": 0,
                "04:00:00 AM": 0,
                "05:00:00 AM": 0,
                "06:00:00 AM": 0,
                "07:00:00 AM": 0,
                "08:00:00 AM": 0,
                "09:00:00 AM": 0,
                "10:00:00 AM": 0,
                "11:00:00 AM": 0,
                "12:00:00 PM": 0,
                "01:00:00 PM": 0,
                "02:00:00 PM": 0,
                "03:00:00 PM": 0,
                "04:00:00 PM": 0,
                "05:00:00 PM": 0,
                "06:00:00 PM": 0,
                "07:00:00 PM": 0,
                "08:00:00 PM": 0,
                "09:00:00 PM": 0,
                "10:00:00 PM": 0,
                "11:00:00 PM": 0,
                "12:00:00 AM": 0
                }
            }

            t = ampmformat('%02d:%02d:%02d' % (date.tm_hour, date.tm_min, date.tm_sec))
            output[month][k]['sum'] += d['value']
            output[month][k]['hourly'][t] += d['value']

f = io.open('data.json', 'w', encoding='utf-8') 
f.write(unicode(json.dumps(output, ensure_ascii=False)))
f.close()

json_output=open('data.json')
output_data = json.load(json_output)
pprint(output_data)
json_output.close()



