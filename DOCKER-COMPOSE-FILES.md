## Docker-compose files

Nexus uses a set of modular docker-compose files to control which services are
spun up and how they are configured for different circumstances. The best way to
understand the purpose of each docker-compose file is to check the
[Makefile](Makefile) and how these files are used there.

Particular care needs to be taken when you want to run the matlab tool. Check
out [the matlab-tool documentation](matlab-tool/README.md) for more detail.
