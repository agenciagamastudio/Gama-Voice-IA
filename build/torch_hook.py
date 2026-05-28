"""
PyInstaller hook for bundling PyTorch and related modules with kokoro TTS.
This hook ensures that torch, numpy, scipy, and kokoro are properly included
in the .exe bundle without requiring external installation at runtime.
"""

from PyInstaller.utils.hooks import collect_submodules, collect_data_files

# Collect all torch-related submodules
hiddenimports = [
    'torch',
    'torch._C',
    'torch.nn',
    'torch.nn.functional',
    'torch.optim',
    'torch.utils',
    'torch.utils.data',
    'numpy',
    'numpy.core',
    'scipy',
    'scipy.signal',
    'scipy.io',
    'librosa',
    'kokoro',
]

# For torch (if available)
try:
    hiddenimports += collect_submodules('torch')
except Exception:
    pass

# For numpy
try:
    hiddenimports += collect_submodules('numpy')
except Exception:
    pass

# For scipy
try:
    hiddenimports += collect_submodules('scipy')
except Exception:
    pass

# For kokoro and dependencies
try:
    hiddenimports += collect_submodules('kokoro')
except Exception:
    pass

# Collect data files for kokoro models and torch
datas = []

try:
    torch_datas = collect_data_files('torch')
    datas.extend(torch_datas)
except Exception:
    pass

try:
    kokoro_datas = collect_data_files('kokoro')
    datas.extend(kokoro_datas)
except Exception:
    pass

# Ensure binary modules are included
binaries = []

# Remove duplicates
hiddenimports = list(set(hiddenimports))

print(f"[torch_hook.py] Hidden imports: {len(hiddenimports)} modules")
print(f"[torch_hook.py] Data files: {len(datas)} items")
print(f"[torch_hook.py] Binaries: {len(binaries)} items")
