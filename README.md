# parse-push-adapter-web

Push adapter with Web for parse-server

See [parse-server push configuration](http://docs.parseplatform.org/parse-server/guide/#push-notifications)

## Silent Notifications

If you have migrated from parse.com and you are seeing situations where silent (newsstand-like presentless) notifications are failing to deliver please ensure that your payload is setting the content-available attribute to Int(1) and not "1" This value will be explicitly checked.

### see more logs

You can enable verbose logging with environment variables:

```
VERBOSE=1

or 

VERBOSE_PARSE_SERVER_PUSH_ADAPTER=1
```

This will produce a more verbose output for all the push sending attempts
