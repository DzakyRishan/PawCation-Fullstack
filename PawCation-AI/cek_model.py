import h5py

with h5py.File('model_ras_hewan_terbaik.h5', 'r') as f:
    def print_attrs(name, obj):
        print(name)
    f.visititems(print_attrs)