param(
  [string]$BaseUrl = $env:API_BASE_URL,
  [string]$AdminEmail = $env:ADMIN_EMAIL,
  [string]$AdminPassword = $env:ADMIN_PASSWORD,
  [int]$Gw1Id = $(if ($env:GW1_ID) { [int]$env:GW1_ID } else { 1 }),
  [int]$Gw2Id = $(if ($env:GW2_ID) { [int]$env:GW2_ID } else { 2 })
)

if (-not $BaseUrl) { $BaseUrl = "http://localhost:3333" }
if (-not $AdminEmail) { $AdminEmail = "admin@admin.com" }
if (-not $AdminPassword) { $AdminPassword = "123456" }

$results = @()

function Summarize-Body($body) {
  if ($null -eq $body) { return $null }
  if ($body -is [System.Array]) {
    return @{
      type = "array"
      count = $body.Count
      firstId = $(if ($body.Count -gt 0 -and $body[0].PSObject.Properties.Match('id').Count -gt 0) { $body[0].id } else { $null })
    }
  }
  if ($body -is [psobject]) {
    return @{
      type = "object"
      keys = @($body.PSObject.Properties.Name | Select-Object -First 10)
    }
  }
  return $body
}

function Record-Result($name, $status, $body, $error) {
  $script:results += @{
    name = $name
    status = $status
    ok = $(if ($null -ne $status) { $status -lt 400 } else { $false })
    body = (Summarize-Body $body)
    error = $error
  }
}

function Record-ExpectedFailure($name, $status, $body, $error) {
  $script:results += @{
    name = $name
    status = $status
    ok = $false
    body = (Summarize-Body $body)
    error = $(if ($error) { $error } else { 'Expected failure but got success' })
  }
}

function Invoke-ApiRaw($method, $path, $token, $body) {
  $headers = @{}
  if ($token) { $headers["Authorization"] = "Bearer $token" }
  try {
    if ($body) {
      $json = ($body | ConvertTo-Json -Depth 10)
      $resp = Invoke-WebRequest -Method $method -Uri "$BaseUrl$path" -Headers $headers -ContentType "application/json" -Body $json
    } else {
      $resp = Invoke-WebRequest -Method $method -Uri "$BaseUrl$path" -Headers $headers
    }
    $data = $resp.Content | ConvertFrom-Json -ErrorAction SilentlyContinue
    return @{ status = $resp.StatusCode; body = $(if ($data) { $data } else { $resp.Content }) }
  } catch {
    return @{ status = $null; body = $null; error = $_.Exception.Message }
  }
}

# Health
$r = Invoke-ApiRaw "GET" "/health" $null $null
Record-Result "GET /health" $r.status $r.body $r.error

# Login
$r = Invoke-ApiRaw "POST" "/login" $null @{ email = $AdminEmail; password = $AdminPassword }
Record-Result "POST /login" $r.status $r.body $r.error
$token = $r.body.token

# Gateways (ADMIN)
if ($token) {
  $r = Invoke-ApiRaw "PATCH" "/gateways/$Gw1Id/status" $token @{ is_active = $true }
  Record-Result "PATCH /gateways/:id/status" $r.status $r.body $r.error

  $r = Invoke-ApiRaw "PATCH" "/gateways/$Gw2Id/priority" $token @{ priority = 2 }
  Record-Result "PATCH /gateways/:id/priority" $r.status $r.body $r.error
} else {
  Record-Result "PATCH /gateways/:id/status (skipped: no token)" $null $null $null
  Record-Result "PATCH /gateways/:id/priority (skipped: no token)" $null $null $null
}

# Products list
if ($token) {
  $r = Invoke-ApiRaw "GET" "/products" $token $null
  Record-Result "GET /products" $r.status $r.body $r.error
  $products = $r.body
} else {
  $products = @()
  Record-Result "GET /products (skipped: no token)" $null $null $null
}

# Create product
$createdProductId = $null
if ($token) {
  $r = Invoke-ApiRaw "POST" "/products" $token @{ name = "Produto Manual $(Get-Date -Format 'yyyyMMddHHmmss')"; amount = 1500 }
  Record-Result "POST /products" $r.status $r.body $r.error
  $createdProductId = $r.body.id
} else {
  Record-Result "POST /products (skipped: no token)" $null $null $null
}

# Purchase
$p1Id = $null
$p2Id = $null
if ($products -is [System.Array] -and $products.Count -gt 0) {
  $p1Id = $products[0].id
  $p2Id = $(if ($products.Count -gt 1) { $products[1].id } else { $products[0].id })
}
if (-not $p1Id -and $createdProductId) {
  $p1Id = $createdProductId
  $p2Id = $createdProductId
}

if ($p1Id) {
  $r = Invoke-ApiRaw "POST" "/purchase" $null @{
    name = "Cliente Manual"
    email = "cliente.manual@example.com"
    cardNumber = "5569000000006063"
    cvv = "010"
    products = @(
      @{ product_id = $p1Id; quantity = 2 },
      @{ product_id = $p2Id; quantity = 1 }
    )
  }
  Record-Result "POST /purchase" $r.status $r.body $r.error

  $r = Invoke-ApiRaw "POST" "/purchase" $null @{
    name = "Cliente Gw1Fail"
    email = "cliente.gw1fail@example.com"
    cardNumber = "5569000000006063"
    cvv = "100"
    products = @(@{ product_id = $p1Id; quantity = 1 })
  }
  Record-Result "POST /purchase (gw1 fail -> gw2 succeed)" $r.status $r.body $r.error

  $r = Invoke-ApiRaw "POST" "/purchase" $null @{
    name = "Cliente Gw2Fail"
    email = "cliente.gw2fail@example.com"
    cardNumber = "5569000000006063"
    cvv = "300"
    products = @(@{ product_id = $p1Id; quantity = 1 })
  }
  Record-Result "POST /purchase (gw2 fail -> gw1 succeed)" $r.status $r.body $r.error

  $r = Invoke-ApiRaw "POST" "/purchase" $null @{
    name = "Cliente BothFail"
    email = "cliente.bothfail@example.com"
    cardNumber = "5569000000006063"
    cvv = "200"
    products = @(@{ product_id = $p1Id; quantity = 1 })
  }
  if ($null -ne $r.status -and $r.status -lt 400) {
    Record-ExpectedFailure "POST /purchase (both gateways fail - cvv 200)" $r.status $r.body $r.error
  } else {
    Record-Result "POST /purchase (both gateways fail - cvv 200)" $r.status $r.body $r.error
  }
} else {
  Record-Result "POST /purchase (skipped: no products)" $null $null $null
}

# Users CRUD
$createdUserId = $null
if ($token) {
  $email = "user.manual.$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
  $r = Invoke-ApiRaw "POST" "/users" $token @{ email = $email; password = "123456"; role = "USER" }
  Record-Result "POST /users" $r.status $r.body $r.error
  $createdUserId = $r.body.id

  $r = Invoke-ApiRaw "GET" "/users" $token $null
  Record-Result "GET /users" $r.status $r.body $r.error
} else {
  Record-Result "GET /users (skipped: no token)" $null $null $null
}

if ($token -and $createdUserId) {
  $r = Invoke-ApiRaw "GET" "/users/$createdUserId" $token $null
  Record-Result "GET /users/:id" $r.status $r.body $r.error

  $r = Invoke-ApiRaw "PUT" "/users/$createdUserId" $token @{ role = "FINANCE" }
  Record-Result "PUT /users/:id" $r.status $r.body $r.error

  $r = Invoke-ApiRaw "DELETE" "/users/$createdUserId" $token $null
  Record-Result "DELETE /users/:id" $r.status $r.body $r.error
}

# Clients
if ($token) {
  $r = Invoke-ApiRaw "GET" "/clients" $token $null
  Record-Result "GET /clients" $r.status $r.body $r.error
  if ($r.body -is [System.Array] -and $r.body.Count -gt 0) {
    $clientId = $r.body[0].id
    $r2 = Invoke-ApiRaw "GET" "/clients/$clientId" $token $null
    Record-Result "GET /clients/:id" $r2.status $r2.body $r2.error
  } else {
    Record-Result "GET /clients/:id (skipped: no clients)" $null $null $null
  }
}

# Transactions
$txId = $null
if ($token) {
  $r = Invoke-ApiRaw "GET" "/transactions" $token $null
  Record-Result "GET /transactions" $r.status $r.body $r.error
  if ($r.body -is [System.Array] -and $r.body.Count -gt 0) {
    $txId = $r.body[0].id
    $r2 = Invoke-ApiRaw "GET" "/transactions/$txId" $token $null
    Record-Result "GET /transactions/:id" $r2.status $r2.body $r2.error
  } else {
    Record-Result "GET /transactions/:id (skipped: no transactions)" $null $null $null
  }
}

# Refund
if ($token -and $txId) {
  $r = Invoke-ApiRaw "POST" "/transactions/$txId/refund" $token $null
  Record-Result "POST /transactions/:id/refund" $r.status $r.body $r.error
}

$outPath = Join-Path $PSScriptRoot "test-results.summary.json"
@{
  baseUrl = $BaseUrl
  results = $results
} | ConvertTo-Json -Depth 8 | Set-Content $outPath

Write-Host "Saved results to $outPath"




