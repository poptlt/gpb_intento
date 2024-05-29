package RPC_APP;
{
    sub new {

        my ($class) = @_;
        my $self = {};
        bless $self, $class;
    }

    sub add_sub {

        my ($self, $name, $sub_ref) = @_;
        my %value = (type => 'sub', sub => $sub_ref); 
        $$self{$name} = \%value;
    }

    sub add_folder {

        my ($self, $name, $path) = @_;
        my %value = (type => 'folder', path => $path); 
        $$self{$name} = \%value;
    }

    sub exec {

        my ($self, $name) = (shift, shift);

        my @arr = split /\./, $name;

        if (@arr > 1) {

            my $folder = shift @arr;
            my $data = $$self{$folder};

            my $type = $$data{type};
            my $path = $$data{path};

            if ($type == 'folder' && ref $path == 'SCALAR') {

                my $folder_app = do $path;

                if (ref $folder_app == 'RPC_APP') {

                    return $folder_app->exec(join('.', @arr), @_);
                } else { 
                    die 'Что-то не то с приложением RPC_APP';
                }
                
            } else {
                die 'Что-то не то с каталогом функций';
            }
        } else {

            my $data = $$self{$name};

            my $type = $$data{type};
            my $sub = $$data{sub};

            if ($type == 'sub' && ref $sub == 'CODE') {
                return &$sub;
            }
            else {
                die 'попытка исполнения не функции!';
            }
        }
    }
}

1