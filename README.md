# Holochain-Battleship

The classic two player game battleship implemented in Holochain

While much of the functionality is working this is still under active development. No validation or UI at this stage.

## Overview

This is an educational example of peer-to-peer interactions usign Holochain. Battleship makes a great example as it requires some interesting mechanics including:

- Keeping your own board layout secret, but immutable in the local chain
- Sending and responding to guesses using messaging 
- Validation of game rules to prevent cheating
- Keeping a validated record of all game results in the shared DHT

## Getting Started

Assuming you have a working installation of Holochain simply clone the repo run in development mode using:
```
hcdev web 
```
from the project directory. To run the tests or test scenarios use
```
hcdev test
```
or 
```
hcdev --mdns=true scenario testGame1
```
## Authors

[Willem Olding](https://github.com/willemolding)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
