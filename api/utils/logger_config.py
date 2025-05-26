import sys
from loguru import logger

# Remove default logger
logger.remove()

# Color configurations for different log levels (for console output)
CONSOLE_FORMAT = (
    "<white>{time:YYYY-MM-DD HH:mm:ss}</white> | "
    "<level>{level: <8}</level> | "
    "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
    "<bold>{level.icon} <level>{message}</level></bold>"
)

# Add handler for stderr to capture logs in Vercel.
# Vercel captures stdout and stderr automatically.
logger.add(
    sys.stderr,
    format=CONSOLE_FORMAT,
    level="DEBUG",  # Or your desired minimum level for Vercel logs
    colorize=True,  # Keep color for local development if you run this locally
)

# Configure custom color levels and icons (cosmetic for console)
logger.level("INFO", color="<green>", icon="ℹ️")
logger.level("SUCCESS", color="<green>", icon="✅")
logger.level("WARNING", color="<yellow>", icon="⚠️")
logger.level("ERROR", color="<red>", icon="❌")
logger.level("CRITICAL", color="<red><bold>", icon="🚨")
logger.level("DEBUG", color="<blue>", icon="🔍")
