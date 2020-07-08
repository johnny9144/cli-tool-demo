portal-locales CLI
==========
The portal-locales CLI is used to manage I18n package from the command line. It is built using [oclif](https://oclif.io).

Overview
========
This is the next generation Node-based I18n Tools.  The goals of this project were to make I18n packages more flexible when downloading from Google Sheet.

Installation
========
Use in local.

```
npm install -g @marvin/portal-locales
```

### OR ###

Use Once time.

```
npx @marvin/portal-locales COMMANDS [OPTIONS]
```


<!-- commands -->
# Command
## `backup`
backup one sheet from the other sheet.

```
USAGE
  $ portal-locales backup

OPTIONS
  -c, --credential=credential  (required) installed credential from google
  -h, --help                   show CLI help
  -n, --sheetName=sheetName    (required) sheet name
  -s, --sheetId=sheetId        (required) sheet ID
  -t, --token=token            (required) token from google
```
## `create`
Create a new worksheet on Google Sheet.

```
USAGE
  $ portal-locales create

OPTIONS
  -c, --credential=credential  (required) installed credential from google
  -h, --help                   show CLI help
  -n, --sheetName=sheetName    (required) target sheet name
  -s, --sheetId=sheetId        (required) sheet ID
  -t, --token=token            (required) token from google
```
## `delete`
Delete a worksheet on Google Sheet.

```
USAGE
  $ portal-locales delete

OPTIONS
  -c, --credential=credential  (required) installed credential from google
  -h, --help                   show CLI help
  -n, --sheetName=sheetName    (required) target sheet name
  -s, --sheetId=sheetId        (required) sheet ID
  -t, --token=token            (required) token from google
```
## `download`
download the worksheet and diff with output.csv.

```
USAGE
  $ portal-locales download

OPTIONS
  -c, --credential=credential  (required) installed credential from google
  -h, --help                   show CLI help
  -n, --sheetName=sheetName    (required) sheet name
  -s, --sheetId=sheetId        (required) sheet ID
  -t, --token=token            (required) token from google
```
## `toJSON`
Convert a csv file to I18n package format.

```
USAGE
  $ portal-locales toJSON FILE

ARGUMENTS
  FILE  csv file to lint

OPTIONS
  -h, --help  show CLI help
```
## `help`
List all commands.

```
USAGE
  $ portal-locales help
  $ portal-locales -h
```
## `lint`
Check if the input csv file is conformed to format

```
USAGE
  $ portal-locales lint FILE

ARGUMENTS
  FILE  csv file to lint

OPTIONS
  -h, --help  show CLI help
```
## `make_diff`
Diff csv file between two files.

```
USAGE
  $ portal-locales make_diff SOURCE1 SOURCE2

ARGUMENTS
  SOURCE1  base csv file path
  SOURCE2  new csv file path

OPTIONS
  -h, --help  show CLI help
```
## `overwrite`
Download the latest worksheet on Google Sheet.

```
USAGE
  $ portal-locales overwrite

OPTIONS
  -c, --credential=credential  (required) installed credential from google
  -h, --help                   show CLI help
  -n, --sheetName=sheetName    (required) sheet name
  -p, --path=path              (required) csv path
  -s, --sheetId=sheetId        (required) sheet ID
  -t, --token=token            (required) token from google
```
## `update`
Update local csv file to the worksheet on Google Sheet.

```
USAGE
  $ portal-locales update

OPTIONS
  -c, --credential=credential  (required) installed credential from google
  -f, --file=file              (required) file path
  -h, --help                   show CLI help
  -n, --sheetName=sheetName    (required) sheet name
  -s, --sheetId=sheetId        (required) sheet ID
  -t, --token=token            (required) token from google
```
## `update_main`
Update local csv file to the worksheet on Google Sheet.

```
USAGE
  $ portal-locales update_main

OPTIONS
  -c, --credential=credential  (required) installed credential from google
  -f, --file=file              (required) output.csv path
  -h, --help                   show CLI help
  -n, --sheetName=sheetName    (required) sheet name of target branch
  -s, --sheetId=sheetId        (required) sheet ID
  -t, --token=token            (required) token from google
```