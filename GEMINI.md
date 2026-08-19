# Package Management Rule

Always use `uv` instead of `pip` for Python package management operations within this project:
- For installing packages, use `uv pip install <package_name>` instead of `pip install <package_name>`.
- For compiling requirements, use `uv pip compile` instead of `pip-compile`.
- For syncing virtual environments, use `uv pip sync` or `uv sync`.
