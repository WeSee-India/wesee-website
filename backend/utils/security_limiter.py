from slowapi import Limiter
from slowapi.util import get_remote_address
from config import settings

# Shared limiter instance for cross-module rate limiting
limiter = Limiter(key_func=get_remote_address, storage_uri=settings.REDIS_URL)
