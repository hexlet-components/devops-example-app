provider "hcloud" {
  token = var.hcloud_token
}

resource "hcloud_server" "devops-example-app" {
  name        = "devops-example-app"
  image       = "docker-ce"
  server_type = "cx11"
  location    = "hel1"
  ssh_keys    = data.hcloud_ssh_keys.all_keys.ssh_keys.*.name
}
