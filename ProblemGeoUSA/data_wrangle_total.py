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

output = {}

for k in data.keys():
    for d in data[k]:
        date = time.strptime(d['date'], "%b %d, %Y %I:%M:%S %p")
        if k in output:
            t = ampmformat('%02d:%02d:%02d' % (date.tm_hour, date.tm_min, date.tm_sec))
            h = date.tm_hour
            output[k]['sum'] += d['value']
            output[k]['hourly'][h] += d['value']
        else:
            output[k] =  { "sum": 0,
                "hourly": [0]*24
            }

            t = ampmformat('%02d:%02d:%02d' % (date.tm_hour, date.tm_min, date.tm_sec))
            h = date.tm_hour
            output[k]['sum'] += d['value']
            output[k]['hourly'][h] += d['value']

f = io.open('data.json', 'w', encoding='utf-8') 
f.write(unicode(json.dumps(output, ensure_ascii=False)))
f.close()

json_output=open('data.json')
output_data = json.load(json_output)
pprint(output_data)
json_output.close()



