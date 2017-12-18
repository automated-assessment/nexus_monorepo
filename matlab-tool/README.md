## Nexus - `matlab` Grader

Takes a submission and attempts to run some MATLAB functions. Scores 0 for errors, 100 otherwise; and returns console output as feedback.

### Tech
- Node.js (4.x)
  - Express (4.x)
  - Written in ES6 using Babel with `stage-0` proposals enabled
  - _See `package.json` for full list of packages_

### Development
#### Requirements
- Node 4.x
- Python
- Matlab -- see details below for setup

### Including matlab tool in the Nexus setup

By default, the matlab grader is not included in the Nexus setup. This is
because of licensing issues, which mean that we cannot simply package Matlab
with Nexus. To include the matlab grader with Nexus, follow these steps:

1. Install Matlab on the host machine and activate it with your license. Your host should probably be a Unix-ish box.
2. Set the `MATLAB_HOME` environment variable to point to the folder where Matlab is installed.
3. Set the `MAC_ADDRESS` environment variable to the MAC address of the host machine (i.e., the MAC address for which the license was activated).
4. Run `make matlab` to enable the matlab grader.
5. Run `make build` ... `make run` as usual.
6. It's probably worth checking that Matlab actually runs correctly. You can do so by invoking `make bash service=matlab-tool` and running `matlab` from the bash prompt that comes up. The most likely source of errors is that you've used the wrong MAC address in Step 3 above. In this case, Matlab will kindly tell you which MAC address it was expecting. Change `MAC_ADDRESS` accordingly (adding in the `:` again) and restart the matlab-tool.
