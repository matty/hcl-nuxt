<template>
  <div class="container">
    <header class="header">
      <h1>HclNuxt Demo</h1>
      <p class="subtitle">JSON to HCL Conversion for Terraform / OpenTofu</p>
    </header>

    <main class="main">
      <!-- Resource Configuration -->
      <section class="config-section">
        <h2>Resource Configuration</h2>
        <div class="config-row">
          <div class="form-group">
            <label for="blockType">Block Type</label>
            <select id="blockType" v-model="blockType">
              <option value="resource">resource</option>
              <option value="data">data</option>
              <option value="variable">variable</option>
              <option value="output">output</option>
              <option value="locals">locals</option>
              <option value="terraform">terraform</option>
            </select>
          </div>
          <div class="form-group">
            <label for="resourceType">Resource Type</label>
            <input
              id="resourceType"
              v-model="resourceType"
              type="text"
              placeholder="e.g., aws_instance"
              :disabled="blockType === 'locals' || blockType === 'terraform'"
            />
          </div>
          <div class="form-group">
            <label for="resourceName">Resource Name</label>
            <input
              id="resourceName"
              v-model="resourceName"
              type="text"
              placeholder="e.g., web"
              :disabled="blockType === 'locals' || blockType === 'terraform'"
            />
          </div>
        </div>
      </section>

      <!-- Editor Panels -->
      <div class="panels">
        <!-- JSON Input -->
        <section class="panel">
          <div class="panel-header">
            <h3>JSON Input</h3>
            <button class="btn btn-secondary" @click="loadExample">
              Load Example
            </button>
          </div>
          <textarea
            v-model="jsonInput"
            class="code-editor"
            placeholder="Enter JSON here..."
            spellcheck="false"
          ></textarea>
          <p v-if="jsonError" class="error">{{ jsonError }}</p>
        </section>

        <!-- HCL Output -->
        <section class="panel">
          <div class="panel-header">
            <h3>HCL Output</h3>
            <button class="btn btn-primary" @click="copyToClipboard">
              {{ copied ? '✓ Copied!' : 'Copy' }}
            </button>
          </div>
          <pre class="code-output"><code>{{ hclOutput }}</code></pre>
        </section>
      </div>
    </main>

    <footer class="footer">
      <p>
        Built with
        <a href="https://nuxt.com" target="_blank">Nuxt</a> and
        <strong>@tfbuilder/hcl-nuxt</strong>
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { block } = useHcl();

const blockType = ref('resource');
const resourceType = ref('aws_instance');
const resourceName = ref('web');
const jsonInput = ref('');
const jsonError = ref('');
const copied = ref(false);

// Compute labels based on block type
const labels = computed(() => {
  if (blockType.value === 'locals' || blockType.value === 'terraform') {
    return [];
  }
  if (blockType.value === 'variable' || blockType.value === 'output') {
    return [resourceType.value || 'my_var'];
  }
  return [resourceType.value, resourceName.value].filter(Boolean);
});

// Parse JSON and generate HCL
const hclOutput = computed(() => {
  if (!jsonInput.value.trim()) {
    return '// Enter JSON to generate HCL';
  }

  try {
    const parsed = JSON.parse(jsonInput.value);
    jsonError.value = '';
    return block(blockType.value, labels.value, parsed);
  } catch (e: unknown) {
    jsonError.value = e instanceof Error ? e.message : 'Invalid JSON';
    return '// Fix JSON errors to see output';
  }
});

// Load example configuration
function loadExample() {
  blockType.value = 'resource';
  resourceType.value = 'aws_instance';
  resourceName.value = 'web';
  jsonInput.value = JSON.stringify(
    {
      ami: 'ami-0c55b159cbfafe1f0',
      instance_type: 't2.micro',
      vpc_security_group_ids: ['sg-0123456789abcdef0'],
      tags: {
        Name: 'HelloWorld',
        Environment: 'development',
      },
    },
    null,
    2
  );
}

// Copy HCL to clipboard
async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(hclOutput.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = hclOutput.value;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  }
}

// Load example on mount
onMounted(() => {
  loadExample();
});
</script>

<style>
:root {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --accent-primary: #3b82f6;
  --accent-hover: #2563eb;
  --accent-success: #22c55e;
  --border-color: #475569;
  --error-color: #ef4444;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--accent-primary), #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: var(--text-secondary);
  margin-top: 0.5rem;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.config-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
}

.config-section h2 {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.config-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.form-group input,
.form-group select {
  padding: 0.75rem 1rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.form-group input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  flex: 1;
}

@media (max-width: 900px) {
  .panels {
    grid-template-columns: 1fr;
  }
}

.panel {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.panel-header h3 {
  font-size: 1rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn-primary {
  background: var(--accent-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--accent-hover);
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--border-color);
}

.code-editor {
  flex: 1;
  min-height: 300px;
  padding: 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.6;
  resize: none;
}

.code-editor:focus {
  outline: none;
  border-color: var(--accent-primary);
}

.code-output {
  flex: 1;
  min-height: 300px;
  padding: 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.6;
  overflow: auto;
  margin: 0;
}

.code-output code {
  color: #a5f3fc;
}

.error {
  color: var(--error-color);
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  color: var(--text-secondary);
}

.footer a {
  color: var(--accent-primary);
  text-decoration: none;
}

.footer a:hover {
  text-decoration: underline;
}
</style>
