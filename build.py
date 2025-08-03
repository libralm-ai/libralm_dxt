#!/usr/bin/env python3
"""
Build script for LibraLM DXT package

This script creates a .dxt file by bundling all necessary files
including Node.js dependencies.
"""

import os
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path
import json


def clean_build():
    """Clean previous build artifacts"""
    print("🧹 Cleaning previous build...")
    if os.path.exists("bundle"):
        shutil.rmtree("bundle")
    if os.path.exists("libralm.dxt"):
        os.remove("libralm.dxt")


def create_bundle_dir():
    """Create bundle directory structure"""
    print("📁 Creating bundle directory...")
    os.makedirs("bundle", exist_ok=True)


def copy_source_files():
    """Copy source files to bundle"""
    print("📄 Copying source files...")
    files_to_copy = [
        "manifest.json",
        "libralm_mcp_server.js",
        "package.json",
        "LICENSE",
        "README.md",
        "icon.png"
    ]
    
    for file in files_to_copy:
        if os.path.exists(file):
            shutil.copy2(file, "bundle/")
            print(f"  ✓ Copied {file}")


def install_dependencies():
    """Install Node.js dependencies into bundle"""
    print("📦 Installing dependencies...")
    
    # Copy package.json to bundle first
    shutil.copy2("package.json", "bundle/")
    
    # Install dependencies in bundle directory
    original_dir = os.getcwd()
    os.chdir("bundle")
    
    try:
        subprocess.run(["npm", "install", "--production"], check=True)
        print("  ✓ Dependencies installed")
    except subprocess.CalledProcessError as e:
        print(f"  ❌ Failed to install dependencies: {e}")
        sys.exit(1)
    finally:
        os.chdir(original_dir)
    
    # Clean up unnecessary files
    print("🧹 Cleaning up dependencies...")
    patterns_to_remove = ["*.md", "*.txt", "test", "tests", "example", "examples", ".github"]
    
    for pattern in patterns_to_remove:
        for path in Path("bundle/node_modules").rglob(pattern):
            if path.is_dir():
                shutil.rmtree(path, ignore_errors=True)
            else:
                try:
                    path.unlink()
                except:
                    pass




def create_dxt_package():
    """Create the final .dxt package"""
    print("📦 Creating DXT package...")
    
    # Create zip file
    with zipfile.ZipFile("libralm.dxt", "w", zipfile.ZIP_DEFLATED) as dxt:
        for root, _, files in os.walk("bundle"):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, "bundle")
                dxt.write(file_path, arcname)
    
    # Get file size
    size = os.path.getsize("libralm.dxt") / 1024 / 1024  # MB
    print(f"\n✅ Created libralm.dxt ({size:.2f} MB)")


def validate_manifest():
    """Validate the manifest.json file"""
    print("🔍 Validating manifest...")
    try:
        with open("manifest.json", "r") as f:
            manifest = json.load(f)
        
        # Check required fields
        required = ["dxt_version", "name", "version", "description", "author", "server"]
        for field in required:
            if field not in manifest:
                print(f"  ❌ Missing required field: {field}")
                return False
        
        print("  ✓ Manifest is valid")
        return True
    except Exception as e:
        print(f"  ❌ Error reading manifest: {e}")
        return False


def check_node():
    """Check if Node.js is installed"""
    try:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"  ✓ Node.js {result.stdout.strip()} found")
            return True
        else:
            print("  ❌ Node.js not found")
            return False
    except FileNotFoundError:
        print("  ❌ Node.js not found")
        return False


def main():
    """Main build process"""
    print("🏗️  Building LibraLM DXT Package")
    print("================================\n")
    
    # Check prerequisites
    if not check_node():
        print("\n❌ Build failed: Node.js is required")
        print("   Please install Node.js from https://nodejs.org/")
        sys.exit(1)
    
    # Validate manifest first
    if not validate_manifest():
        print("\n❌ Build failed: Invalid manifest.json")
        sys.exit(1)
    
    try:
        clean_build()
        create_bundle_dir()
        copy_source_files()
        install_dependencies()
        create_dxt_package()
        
        # Clean up
        print("\n🧹 Cleaning up...")
        shutil.rmtree("bundle")
        
        print("\n✨ Build complete!")
        print("\nTo install in Claude Desktop:")
        print("1. Open Claude Desktop")
        print("2. Go to Settings > Extensions")
        print("3. Click 'Install from file...'")
        print("4. Select libralm.dxt")
        
    except Exception as e:
        print(f"\n❌ Build failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()