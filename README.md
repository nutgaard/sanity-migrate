# sanity-migrate

:construction: WIP :construction:

A simple CLI tool to help migrate [sanity.io](https://www.sanity.io/) data.


Install:
```
npm i @nutgaard/sanity-migrate -g
```

**Commands:**
```
sanity-migrate install      Creates a hidden sanity document for tracking migrations
sanity-migrate uninstall    Deletes the hidden sanity document for tracking migrations
sanity-migrate status       Lists the current status of migrations
sanity-migrate clean        Resets the hidden document
sanity-migrate migrate      Run the migrations      
sanity-migrate help         Prints the help
```