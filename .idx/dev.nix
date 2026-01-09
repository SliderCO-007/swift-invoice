# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-24.11"; # or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_20
  ];
  # Sets environment variables in the workspace
  env = {};
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      "vue.volar"
    ];
    workspace = {
      # Runs when a workspace is first created with this \`dev.nix\` file
      onCreate = {
        npm-install = "npm ci --no-audit --prefer-offline --no-progress --timing";
        # Open editors for the following files by default, if they exist:
        default.openFiles = [ "src/App.vue" ];
      };
      # To run something each time the workspace is (re)started, use the \`onStart\` hook
      onStart = {
        # example: "npm run dev"
      };
    };
    # The following attributes are used to configure preview ports.
    # To learn more, see: https://developers.google.com/idx/guides/preview-ports
    previews = {
      enable = false;
      previews = [
        {
          # The port to expose on.
          port = 5173;
          # What to do when the port is opened.
          # The supported actions are: "open-preview", "open-url", "ignore".
          onOpen = "open-preview";
          # A human-readable name for the preview.
          name = "Web Preview";
          # The command to run to start the preview.
          command = [ "npm" "run" "dev" "--" "--port" "5173" ];
        }
      ];
    };
  };
}
