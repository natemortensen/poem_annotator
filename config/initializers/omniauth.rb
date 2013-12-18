OmniAuth.config.logger = Rails.logger

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :twitter, 'MErxIpBTfF6khR2sXOOfA', '3z62rUT3U6hDMIystc9zAItHimKWS5jlNP62iai6x8'
  provider :facebook, 225002161005402, '3572287a0b737b1d57518575e6a8d1a7'
end