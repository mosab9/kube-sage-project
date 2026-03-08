from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    kubeconfig: str = ""
    ollama_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.1"
    loki_url: str = "http://localhost:3100"
    prometheus_url: str = "http://localhost:9090"
    elasticsearch_url: str = "http://localhost:9200"
    elasticsearch_enabled: bool = False
    k8s_watcher_enabled: bool = True
    app_host: str = "0.0.0.0"
    app_port: int = 8000

    model_config = {"env_file": ".env"}


settings = Settings()
