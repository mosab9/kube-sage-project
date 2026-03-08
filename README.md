Kube-Sage


Kube-sage Runbook:
==================

Helm:

	/Users/musababdelrahman/Desktop/Dev/GitHub/kube-sage/helm
	helm install monitoring ./monitoring
	helm list
	kubectl get pods

Expose service:

	kubectl port-forward svc/loki 3100:3100 -n default
	kubectl port-forward svc/prometheus 9090:9090 -n default
	kubectl port-forward svc/kube-metrics-simulator 8080:8080
	kubectl port-forward svc/grafana 3000:3000

Run kube-sage-manager:                                                                                    
                                                                                                                                                   
  export KUBECONFIG=~/.kube/kubesage-config                                                                                                        
  export OLLAMA_URL=http://localhost:11434                                                                                                         
  uvicorn app.main:app --reload --port 8000

Run the kube-sage-web:

	npm install
	npm run dev
